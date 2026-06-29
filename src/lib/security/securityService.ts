import type { AdminPermission, AdminRole, AdminSession } from "@/types/admin";

export function maskEmail(value: string) {
  const [name, domain] = value.split("@");

  if (!name || !domain) {
    return "masked";
  }

  return `${name.slice(0, 2)}***@${domain}`;
}

export function maskPhone(value?: string) {
  if (!value) {
    return "";
  }

  const digits = value.replace(/\D/g, "");
  return digits.length >= 4 ? `******${digits.slice(-4)}` : "******";
}

export function canPerform(session: AdminSession | null, permission: AdminPermission) {
  return Boolean(session?.permissions.includes(permission));
}

export function rolePermissionRows(roles: AdminRole[]) {
  const allPermissions = [...new Set(roles.flatMap((role) => role.permissions))].sort();
  return roles.map((role) => ({
    role,
    permissions: allPermissions.map((permission) => ({
      key: permission,
      enabled: role.permissions.includes(permission)
    }))
  }));
}

export function validateSecureUpload(fileName: string) {
  const allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".pdf"];
  const lowerName = fileName.trim().toLowerCase();
  const extension = allowedExtensions.find((item) => lowerName.endsWith(item));

  return {
    ok: Boolean(extension) && !lowerName.includes(".."),
    message: extension
      ? "File extension accepted by secure upload placeholder."
      : "Only PNG, JPG, WEBP, and PDF placeholders are accepted."
  };
}
