import type { AdminSession } from "@/types/admin";

export function adminJsonHeaders(session: AdminSession | null, json = false) {
  const headers: Record<string, string> = {};

  if (json) {
    headers["Content-Type"] = "application/json";
  }

  if (session) {
    headers["x-admin-session"] = JSON.stringify(session);
  }

  return headers;
}

