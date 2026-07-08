import { NextResponse } from "next/server";
import { z } from "zod";
import {
  changeAdminPassword,
  cleanEnvValue,
  ensureOwnerAdminAccount,
  updateAdminPasswordByEmail
} from "@/lib/admin/adminAccounts";
import type { AdminSession } from "@/types/admin";

const passwordChangeSchema = z.union([
  z.object({
    currentPassword: z.string().min(1),
    email: z.string().email(),
    mode: z.literal("change"),
    newPassword: z.string().min(6).max(128)
  }),
  z.object({
    email: z.string().email(),
    mode: z.literal("recover"),
    newPassword: z.string().min(6).max(128),
    ownerEmail: z.string().email(),
    ownerPassword: z.string().min(1)
  })
]);

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

export async function PATCH(request: Request) {
  try {
    const input = passwordChangeSchema.parse(await request.json());

    if (input.mode === "change") {
      const session = getSessionFromRequest(request);

      if (!session || session.email.toLowerCase() !== input.email.trim().toLowerCase()) {
        return NextResponse.json({ message: "Login again before changing your password." }, { status: 403 });
      }

      const sessionAfterChange = await changeAdminPassword(input);

      return NextResponse.json({
        message: "Password updated successfully.",
        session: sessionAfterChange
      });
    }

    const ownerEmail = cleanEnvValue(process.env.ADMIN_EMAIL).toLowerCase();
    const ownerPassword = cleanEnvValue(process.env.ADMIN_PASSWORD);

    if (!ownerEmail || !ownerPassword) {
      return NextResponse.json({ message: "Recovery is not configured for this deployment." }, { status: 500 });
    }

    if (input.ownerEmail.trim().toLowerCase() !== ownerEmail || input.ownerPassword !== ownerPassword) {
      return NextResponse.json({ message: "Owner recovery credentials are incorrect." }, { status: 401 });
    }

    await ensureOwnerAdminAccount();
    const sessionAfterRecovery = await updateAdminPasswordByEmail(input.email, input.newPassword);

    return NextResponse.json({
      message: "Access recovered. Use your new password to sign in.",
      session: sessionAfterRecovery
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Enter valid password details."
        : error instanceof Error
          ? error.message
          : "Unable to update password right now.";

    return NextResponse.json({ message }, { status: 400 });
  }
}
