import type { AdminUser, PermissionKey } from "@/types/models";

export function hasPermission(admin: AdminUser, permission: PermissionKey) {
  return admin.roles.some((role) =>
    role.permissions.some((rolePermission) => rolePermission.key === permission)
  );
}

export function requireAdminPlaceholder() {
  return {
    authenticated: false,
    reason: "Admin authentication and session enforcement will be wired in a later phase."
  };
}
