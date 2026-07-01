import type { AdminAuditLogEntry } from "@/types/admin";

export const seededAuditLogs: AdminAuditLogEntry[] = [
  {
    action: "admin.login",
    actorEmail: "owner@store-admin.in",
    actorId: "admin-owner",
    actorName: "Store Owner",
    at: "2026-06-29T08:30:00.000Z",
    entityType: "AdminSession",
    ipAddress: "103.24.xxx.xxx",
    metadata: { result: "success" },
    module: "security",
    userAgent: "Chrome on Windows"
  },
  {
    action: "admin.product.price_change",
    actorEmail: "owner@store-admin.in",
    actorId: "admin-owner",
    actorName: "Store Owner",
    at: "2026-06-29T08:45:00.000Z",
    entityId: "var-whey-choco-1kg",
    entityType: "ProductVariant",
    ipAddress: "103.24.xxx.xxx",
    module: "catalog",
    oldValue: { sellingPrice: 3199 },
    newValue: { sellingPrice: 2999 },
    userAgent: "Chrome on Windows"
  },
  {
    action: "admin.inventory.stock_adjustment",
    actorEmail: "inventory@store-admin.in",
    actorId: "admin-inventory",
    actorName: "Inventory Manager",
    at: "2026-06-28T16:20:00.000Z",
    entityId: "batch-whey-a1",
    entityType: "InventoryBatch",
    ipAddress: "103.24.xxx.xxx",
    metadata: { reason: "Damaged inbound carton" },
    module: "inventory",
    oldValue: { damagedQuantity: 0 },
    newValue: { damagedQuantity: 2 },
    userAgent: "Chrome on Windows"
  },
  {
    action: "admin.cms.publish",
    actorEmail: "content@store-admin.in",
    actorId: "admin-content",
    actorName: "Content Manager",
    at: "2026-06-27T12:10:00.000Z",
    entityId: "homepage",
    entityType: "CMSPage",
    ipAddress: "103.24.xxx.xxx",
    module: "cms",
    oldValue: { status: "draft" },
    newValue: { status: "published" },
    userAgent: "Chrome on Windows"
  },
  {
    action: "admin.login.failed",
    actorEmail: "unknown@store-admin.in",
    actorId: "system",
    actorName: "System",
    at: "2026-06-26T20:02:00.000Z",
    entityType: "AdminSession",
    ipAddress: "103.24.xxx.xxx",
    metadata: { reason: "Invalid password", rateLimitChecked: true },
    module: "security",
    userAgent: "Chrome on Windows"
  }
];

export const securityChecklist = [
  "Two-factor authentication",
  "Password reset workflow",
  "Session timeout",
  "Rate limiting",
  "Input validation",
  "Secure file upload validation",
  "Sensitive data masking"
] as const;
