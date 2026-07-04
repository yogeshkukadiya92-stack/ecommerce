import type { AdminPermission, AdminRole, AdminSession } from "@/types/admin";
import { writeAdminAuditLog } from "./auditLog";

const ADMIN_SESSION_KEY = "fitsupplement.admin.session.v1";
const ADMIN_EVENT_NAME = "fitsupplement:admin-auth";

export const adminRoles: AdminRole[] = [
  {
    description: "Full control over ecommerce operations.",
    id: "role-super-admin",
    name: "Super Admin",
    permissions: [
      "dashboard:read",
      "catalog:read",
      "catalog:write",
      "product:create",
      "product:edit",
      "product:delete",
      "product:delist",
      "products:bulk",
      "price:change",
      "inventory:read",
      "inventory:write",
      "stock:adjust",
      "orders:read",
      "orders:write",
      "order:refund",
      "customers:read",
      "coupon:create",
      "content:write",
      "cms:publish",
      "analytics:read",
      "settings:write",
      "user:manage",
      "security:manage",
      "compliance:read",
      "compliance:write",
      "recall:manage",
      "audit:read"
    ]
  },
  {
    description: "General admin with broad operational access except user and security management.",
    id: "role-admin",
    name: "Admin",
    permissions: [
      "dashboard:read",
      "catalog:read",
      "catalog:write",
      "product:create",
      "product:edit",
      "inventory:read",
      "orders:read",
      "orders:write",
      "customers:read",
      "coupon:create",
      "content:write",
      "analytics:read",
      "compliance:read"
    ]
  },
  {
    description: "Catalog and inventory operator.",
    id: "role-catalog-manager",
    name: "Catalog Manager",
    permissions: [
      "dashboard:read",
      "catalog:read",
      "catalog:write",
      "product:create",
      "product:edit",
      "products:bulk",
      "price:change",
      "inventory:read",
      "compliance:read"
    ]
  },
  {
    description: "Warehouse, batch, stock movement, FEFO, and purchase order operations.",
    id: "role-inventory-manager",
    name: "Inventory Manager",
    permissions: ["dashboard:read", "inventory:read", "inventory:write", "stock:adjust", "recall:manage", "audit:read"]
  },
  {
    description: "Order fulfillment, shipment, return, and refund workflows.",
    id: "role-order-manager",
    name: "Order Manager",
    permissions: ["dashboard:read", "orders:read", "orders:write", "order:refund", "inventory:read", "customers:read"]
  },
  {
    description: "Promotions, coupons, loyalty, referral, and marketing automation.",
    id: "role-marketing-manager",
    name: "Marketing Manager",
    permissions: ["dashboard:read", "coupon:create", "content:write", "customers:read", "analytics:read"]
  },
  {
    description: "CMS, blog, policy pages, homepage studio, and publish workflow.",
    id: "role-content-manager",
    name: "Content Manager",
    permissions: ["dashboard:read", "content:write", "cms:publish", "catalog:read", "compliance:read"]
  },
  {
    description: "Customer service, Q&A, review moderation, and order lookup.",
    id: "role-customer-support",
    name: "Customer Support",
    permissions: ["dashboard:read", "customers:read", "orders:read", "catalog:read"]
  },
  {
    description: "Finance reporting, refunds, payment review, and audit visibility.",
    id: "role-finance-manager",
    name: "Finance Manager",
    permissions: ["dashboard:read", "orders:read", "order:refund", "analytics:read", "audit:read"]
  },
  {
    description: "Read-only access to operational dashboards and audit logs.",
    id: "role-read-only-auditor",
    name: "Read-only Auditor",
    permissions: ["dashboard:read", "catalog:read", "inventory:read", "orders:read", "customers:read", "analytics:read", "audit:read", "compliance:read"]
  }
];

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function permissionsForRoles(roles: AdminRole[]) {
  return [...new Set(roles.flatMap((role) => role.permissions))];
}

export function createAdminSession(admin: { adminId: string; email: string; fullName: string; roles: AdminRole[] }): AdminSession {
  return {
    adminId: admin.adminId,
    email: admin.email,
    fullName: admin.fullName,
    lastLoginAt: new Date().toISOString(),
    permissions: permissionsForRoles(admin.roles),
    roles: admin.roles
  };
}

export function persistAdminSession(session: AdminSession) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
  window.dispatchEvent(new CustomEvent(ADMIN_EVENT_NAME, { detail: session }));
  writeAdminAuditLog(session, {
    action: "admin.login",
    entityType: "AdminSession",
    metadata: { roleNames: session.roles.map((role) => role.name) }
  });
}

export function getCurrentAdminSession(): AdminSession | null {
  if (!canUseStorage()) {
    return null;
  }

  const rawSession = window.localStorage.getItem(ADMIN_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AdminSession;
  } catch {
    return null;
  }
}

export function hasAdminPermission(session: AdminSession | null, permission: AdminPermission) {
  return Boolean(session?.permissions.includes(permission));
}

export const sensitivePermissionMap = {
  "product:create": "Product create",
  "product:edit": "Product edit",
  "product:delete": "Product delete",
  "price:change": "Price change",
  "stock:adjust": "Stock adjustment",
  "order:refund": "Order refund",
  "coupon:create": "Coupon creation",
  "cms:publish": "CMS publish",
  "user:manage": "User management"
} satisfies Partial<Record<AdminPermission, string>>;

export function logoutAdmin() {
  const session = getCurrentAdminSession();

  if (!canUseStorage()) {
    return;
  }

  writeAdminAuditLog(session, {
    action: "admin.logout",
    entityType: "AdminSession"
  });
  window.localStorage.removeItem(ADMIN_SESSION_KEY);
  window.dispatchEvent(new CustomEvent(ADMIN_EVENT_NAME));
}

export function subscribeToAdminAuth(callback: (session: AdminSession | null) => void) {
  if (!canUseStorage()) {
    return () => undefined;
  }

  const handler = () => callback(getCurrentAdminSession());
  window.addEventListener(ADMIN_EVENT_NAME, handler);
  window.addEventListener("storage", handler);

  return () => {
    window.removeEventListener(ADMIN_EVENT_NAME, handler);
    window.removeEventListener("storage", handler);
  };
}
