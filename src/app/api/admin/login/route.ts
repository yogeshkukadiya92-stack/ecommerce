import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateDbAdmin, cleanEnvValue, ensureOwnerAdminAccount } from "@/lib/admin/adminAccounts";
import { adminRoles, createAdminSession } from "@/lib/admin/adminAuth";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const email = input.email.trim().toLowerCase();
    const password = input.password;
    const dbSession = await authenticateDbAdmin(email, password);

    if (dbSession) {
      return NextResponse.json({
        message: "Admin login successful.",
        session: dbSession
      });
    }

    const adminEmail = cleanEnvValue(process.env.ADMIN_EMAIL);
    const adminPassword = cleanEnvValue(process.env.ADMIN_PASSWORD);
    const adminName = cleanEnvValue(process.env.ADMIN_NAME) || "Store Owner";

    if (!adminEmail || !adminPassword) {
      return NextResponse.json({ message: "Admin login is not configured." }, { status: 500 });
    }

    if (email !== adminEmail.toLowerCase() || password !== adminPassword) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    const ownerAdmin = await ensureOwnerAdminAccount();

    const session = ownerAdmin
      ? createAdminSession(ownerAdmin)
      : createAdminSession({
          adminId: "admin-owner",
          email: adminEmail,
          fullName: adminName || "Store Owner",
          roles: [adminRoles[0]]
        });

    return NextResponse.json({
      message: "Admin login successful.",
      session
    });
  } catch (error) {
    const message = error instanceof z.ZodError ? "Enter a valid admin email and password." : "Unable to login right now.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
