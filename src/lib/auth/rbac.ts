import type { AdminUser, PermissionKey } from "@/types/models";

export function hasPermission(admin: AdminUser, permission: PermissionKey) {
  return admin.roles.some((role) =>
    role.permissions.some((rolePermission) => rolePermission.key === permission)
  );
}

export function requireAdminPlaceholder() {
  return {
    authenticated: false,
    reason: "Admin route protection is enforced by the admin session shell; server-side middleware can be connected when a persistent auth provider is added."
  };
}
