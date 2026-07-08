import { Prisma } from "@prisma/client";
import type { AdminPermission, AdminRole, AdminSession } from "@/types/admin";
import { adminRoles, createAdminSession } from "@/lib/admin/adminAuth";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

type AdminRecord = Awaited<ReturnType<typeof findAdminByEmail>>;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function cleanEnvValue(value?: string) {
  return (value ?? "").trim().replace(/^['"]|['"]$/g, "");
}

export async function ensureAdminAccessSetup() {
  const permissionRecords = await Promise.all(
    [...new Set(adminRoles.flatMap((role) => role.permissions))].map((permission) =>
      prisma.permission.upsert({
        create: {
          description: `${permission} permission`,
          key: permission,
          name: permission
        },
        update: {
          description: `${permission} permission`,
          name: permission
        },
        where: {
          key: permission
        }
      })
    )
  );

  const permissionByKey = new Map(permissionRecords.map((permission) => [permission.key, permission]));

  await Promise.all(
    adminRoles.map((role) =>
      prisma.role.upsert({
        create: {
          description: role.description,
          name: role.name,
          permissions: {
            connect: role.permissions
              .map((permission) => permissionByKey.get(permission))
              .filter((permission): permission is NonNullable<typeof permission> => Boolean(permission))
              .map((permission) => ({ id: permission.id }))
          }
        },
        update: {
          description: role.description,
          permissions: {
            set: role.permissions
              .map((permission) => permissionByKey.get(permission))
              .filter((permission): permission is NonNullable<typeof permission> => Boolean(permission))
              .map((permission) => ({ id: permission.id }))
          }
        },
        where: {
          name: role.name
        }
      })
    )
  );
}

export async function findAdminByEmail(email: string) {
  return prisma.user.findUnique({
    include: {
      adminUser: {
        include: {
          roles: {
            include: {
              permissions: true
            }
          }
        }
      }
    },
    where: {
      email: normalizeEmail(email)
    }
  });
}

export function sessionFromAdminRecord(adminRecord: NonNullable<AdminRecord>) {
  const adminUser = adminRecord.adminUser;

  if (!adminUser) {
    throw new Error("Admin user record is missing.");
  }

  return createAdminSession({
    adminId: adminUser.id,
    email: adminRecord.email,
    fullName: adminUser.name,
    roles: adminUser.roles.map(mapDbRoleToSessionRole)
  });
}

function mapDbRoleToSessionRole(role: {
  description: string | null;
  id: string;
  name: string;
  permissions: Array<{ key: string }>;
}): AdminRole {
  return {
    description: role.description ?? "",
    id: role.id,
    name: role.name,
    permissions: role.permissions.map((permission) => permission.key as AdminPermission)
  };
}

export async function authenticateDbAdmin(email: string, password: string) {
  const adminRecord = await findAdminByEmail(email);

  if (!adminRecord || adminRecord.status !== "ACTIVE" || !adminRecord.adminUser) {
    return null;
  }

  if (!verifyPassword(password, adminRecord.passwordHash)) {
    return null;
  }

  await prisma.adminUser.update({
    data: {
      lastLoginAt: new Date()
    },
    where: {
      id: adminRecord.adminUser.id
    }
  });

  return sessionFromAdminRecord(adminRecord);
}

export async function ensureOwnerAdminAccount() {
  const adminEmail = cleanEnvValue(process.env.ADMIN_EMAIL);
  const adminPassword = cleanEnvValue(process.env.ADMIN_PASSWORD);
  const adminName = cleanEnvValue(process.env.ADMIN_NAME) || "Store Owner";

  if (!adminEmail || !adminPassword) {
    return null;
  }

  await ensureAdminAccessSetup();

  const superAdminRole = await prisma.role.findUnique({
    where: {
      name: adminRoles[0].name
    }
  });

  if (!superAdminRole) {
    throw new Error("Super Admin role is not available.");
  }

  const user = await prisma.user.upsert({
    create: {
      email: normalizeEmail(adminEmail),
      passwordHash: hashPassword(adminPassword),
      status: "ACTIVE"
    },
    update: {
      email: normalizeEmail(adminEmail),
      passwordHash: hashPassword(adminPassword),
      status: "ACTIVE"
    },
    where: {
      email: normalizeEmail(adminEmail)
    }
  });

  const adminUser = await prisma.adminUser.upsert({
    create: {
      name: adminName,
      roles: {
        connect: [{ id: superAdminRole.id }]
      },
      user: {
        connect: {
          id: user.id
        }
      }
    },
    update: {
      name: adminName,
      roles: {
        set: [{ id: superAdminRole.id }]
      }
    },
    where: {
      userId: user.id
    }
  });

  return {
    adminId: adminUser.id,
    email: user.email,
    fullName: adminUser.name,
    roles: [adminRoles[0]]
  };
}

export async function createAdminAccount(input: {
  email: string;
  fullName: string;
  password: string;
  roleNames: string[];
}) {
  await ensureAdminAccessSetup();

  const email = normalizeEmail(input.email);
  const roleNames = [...new Set(input.roleNames.map((roleName) => roleName.trim()).filter(Boolean))];

  if (!roleNames.length) {
    throw new Error("Select at least one admin role.");
  }

  const roles = await prisma.role.findMany({
    where: {
      name: {
        in: roleNames
      }
    }
  });

  if (roles.length !== roleNames.length) {
    throw new Error("One or more selected roles are unavailable.");
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(input.password),
        status: "ACTIVE"
      }
    });

    const adminUser = await prisma.adminUser.create({
      data: {
        name: input.fullName.trim(),
        roles: {
          connect: roles.map((role) => ({ id: role.id }))
        },
        user: {
          connect: {
            id: user.id
          }
        }
      }
    });

    return {
      adminId: adminUser.id,
      email: user.email,
      fullName: adminUser.name
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new Error("An admin with this email already exists.");
    }

    throw error;
  }
}

export async function listAdminAccounts() {
  await ensureAdminAccessSetup();

  const admins = await prisma.adminUser.findMany({
    include: {
      roles: {
        include: {
          permissions: true
        }
      },
      user: true
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  return admins.map((admin) => ({
    email: admin.user.email,
    fullName: admin.name,
    id: admin.id,
    lastLoginAt: admin.lastLoginAt?.toISOString() ?? null,
    roles: admin.roles.map((role) => role.name)
  }));
}

export function getAvailableAdminRoles() {
  return adminRoles.map((role) => ({
    description: role.description,
    name: role.name,
    permissions: role.permissions.length
  }));
}

export async function updateAdminPasswordByEmail(email: string, newPassword: string) {
  const adminRecord = await findAdminByEmail(email);

  if (!adminRecord || !adminRecord.adminUser) {
    throw new Error("Admin account not found.");
  }

  await prisma.user.update({
    data: {
      passwordHash: hashPassword(newPassword)
    },
    where: {
      id: adminRecord.id
    }
  });

  return sessionFromAdminRecord({
    ...adminRecord,
    passwordHash: hashPassword(newPassword)
  });
}

export async function changeAdminPassword(input: {
  currentPassword: string;
  email: string;
  newPassword: string;
}) {
  const adminRecord = await findAdminByEmail(input.email);

  if (!adminRecord || !adminRecord.adminUser) {
    throw new Error("Admin account not found.");
  }

  if (!verifyPassword(input.currentPassword, adminRecord.passwordHash)) {
    throw new Error("Current password is incorrect.");
  }

  return updateAdminPasswordByEmail(input.email, input.newPassword);
}

export function sessionCanManageAdmins(session: AdminSession | null) {
  return Boolean(
    session &&
      (session.permissions.includes("user:manage") ||
        session.permissions.includes("security:manage") ||
        session.permissions.includes("settings:write"))
  );
}
