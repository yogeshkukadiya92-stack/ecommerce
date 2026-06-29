import type { PermissionKey } from "./models";

export type AdminPermission =
  | PermissionKey
  | "dashboard:read"
  | "products:bulk"
  | "product:create"
  | "product:edit"
  | "product:delete"
  | "product:delist"
  | "price:change"
  | "stock:adjust"
  | "order:refund"
  | "coupon:create"
  | "cms:publish"
  | "user:manage"
  | "security:manage"
  | "compliance:read"
  | "compliance:write"
  | "recall:manage"
  | "audit:read";

export type AdminRole = {
  description: string;
  id: string;
  name: string;
  permissions: AdminPermission[];
};

export type AdminSession = {
  adminId: string;
  email: string;
  fullName: string;
  lastLoginAt: string;
  permissions: AdminPermission[];
  roles: AdminRole[];
};

export type AdminAuditLogEntry = {
  action: string;
  actorEmail: string;
  actorId: string;
  actorName?: string;
  at: string;
  entityId?: string;
  entityType: string;
  ipAddress?: string;
  metadata?: Record<string, unknown>;
  module: string;
  newValue?: unknown;
  oldValue?: unknown;
  userAgent?: string;
};
