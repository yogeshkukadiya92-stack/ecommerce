import type { AdminAuditLogEntry, AdminSession } from "@/types/admin";

const AUDIT_LOG_KEY = "fitsupplement.admin.audit.v1";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function readAdminAuditLogs() {
  if (!canUseStorage()) {
    return [];
  }

  const rawLogs = window.localStorage.getItem(AUDIT_LOG_KEY);

  if (!rawLogs) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawLogs);
    return Array.isArray(parsed) ? (parsed as AdminAuditLogEntry[]) : [];
  } catch {
    return [];
  }
}

export function writeAdminAuditLog(
  session: AdminSession | null,
  entry: Omit<AdminAuditLogEntry, "actorEmail" | "actorId" | "actorName" | "at" | "module" | "ipAddress" | "userAgent"> &
    Partial<Pick<AdminAuditLogEntry, "actorName" | "ipAddress" | "module" | "userAgent">>
) {
  if (!canUseStorage()) {
    return;
  }

  const nextEntry: AdminAuditLogEntry = {
    ...entry,
    actorEmail: session?.email ?? "system",
    actorId: session?.adminId ?? "system",
    actorName: entry.actorName ?? session?.fullName ?? "System",
    at: new Date().toISOString(),
    ipAddress: entry.ipAddress ?? "Current session",
    module: entry.module ?? moduleFromAction(entry.action),
    userAgent: entry.userAgent ?? getDevicePlaceholder()
  };

  window.localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify([nextEntry, ...readAdminAuditLogs()].slice(0, 250)));
  window.dispatchEvent(new CustomEvent("fitsupplement:admin-audit"));
}

function moduleFromAction(action: string) {
  if (action.includes("inventory") || action.includes("stock")) return "inventory";
  if (action.includes("order") || action.includes("refund")) return "orders";
  if (action.includes("coupon")) return "promotions";
  if (action.includes("cms") || action.includes("content")) return "cms";
  if (action.includes("compliance") || action.includes("claim") || action.includes("recall")) return "compliance";
  if (action.includes("login") || action.includes("logout") || action.includes("security")) return "security";
  if (action.includes("customer") || action.includes("crm")) return "customers";
  if (action.includes("product") || action.includes("price") || action.includes("catalog")) return "catalog";
  return "system";
}

function getDevicePlaceholder() {
  if (typeof navigator === "undefined") {
    return "Browser device";
  }

  return navigator.userAgent.includes("Windows") ? "Windows browser" : "Browser device";
}
