import { NextResponse } from "next/server";
import { adminRoles, createAdminSession } from "@/lib/admin/adminAuth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = body?.email?.trim() ?? "";
  const password = body?.password ?? "";
  const adminEmail = cleanEnvValue(process.env.ADMIN_EMAIL ?? process.env.NEXT_PUBLIC_ADMIN_EMAIL);
  const adminPassword = cleanEnvValue(process.env.ADMIN_PASSWORD ?? process.env.NEXT_PUBLIC_ADMIN_PASSWORD);
  const adminName = cleanEnvValue(process.env.ADMIN_NAME ?? process.env.NEXT_PUBLIC_ADMIN_NAME) || "Store Owner";

  if (!adminEmail || !adminPassword) {
    return NextResponse.json({ message: "Admin login is not configured." }, { status: 500 });
  }

  if (email.toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
    return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
  }

  const session = createAdminSession({
    adminId: "admin-owner",
    email: adminEmail,
    fullName: adminName || "Store Owner",
    roles: [adminRoles[0]]
  });

  return NextResponse.json({
    message: "Admin login successful.",
    session
  });
}

function cleanEnvValue(value?: string) {
  return (value ?? "").trim().replace(/^['"]|['"]$/g, "");
}
