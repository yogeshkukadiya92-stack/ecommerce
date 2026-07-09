import { NextResponse } from "next/server";
import type { AdminPermission, AdminSession } from "@/types/admin";

export function getAdminSessionFromRequest(request: Request) {
  const sessionHeader = request.headers.get("x-admin-session");

  if (!sessionHeader) {
    return null;
  }

  try {
    const session = JSON.parse(sessionHeader) as Partial<AdminSession>;
    return session.adminId && session.email && Array.isArray(session.permissions) ? (session as AdminSession) : null;
  } catch {
    return null;
  }
}

export function requireAdminPermission(request: Request, permission: AdminPermission) {
  const session = getAdminSessionFromRequest(request);

  if (!session) {
    return {
      response: NextResponse.json({ message: "Admin login is required." }, { status: 401 }),
      session: null
    };
  }

  if (!session.permissions.includes(permission)) {
    return {
      response: NextResponse.json({ message: "You do not have permission for this admin action." }, { status: 403 }),
      session
    };
  }

  return {
    response: null,
    session
  };
}

