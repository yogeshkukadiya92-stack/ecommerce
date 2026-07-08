import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createAdminAccount,
  getAvailableAdminRoles,
  listAdminAccounts,
  sessionCanManageAdmins
} from "@/lib/admin/adminAccounts";
import type { AdminSession } from "@/types/admin";

const createAdminSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  password: z.string().min(6).max(128),
  roleNames: z.array(z.string().min(1)).min(1)
});

function getSessionFromRequest(request: Request) {
  const sessionHeader = request.headers.get("x-admin-session");

  if (!sessionHeader) {
    return null;
  }

  try {
    return JSON.parse(sessionHeader) as AdminSession;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const session = getSessionFromRequest(request);

  if (!sessionCanManageAdmins(session)) {
    return NextResponse.json({ message: "Admin access is required." }, { status: 403 });
  }

  const [admins, roles] = await Promise.all([listAdminAccounts(), Promise.resolve(getAvailableAdminRoles())]);

  return NextResponse.json({
    admins,
    roles
  });
}

export async function POST(request: Request) {
  const session = getSessionFromRequest(request);

  if (!sessionCanManageAdmins(session)) {
    return NextResponse.json({ message: "You do not have permission to create admins." }, { status: 403 });
  }

  try {
    const input = createAdminSchema.parse(await request.json());
    const admin = await createAdminAccount(input);

    return NextResponse.json(
      {
        admin,
        message: "Admin account created successfully."
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Enter valid admin details."
        : error instanceof Error
          ? error.message
          : "Unable to create admin right now.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
