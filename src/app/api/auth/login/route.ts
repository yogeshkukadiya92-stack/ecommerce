import { NextResponse } from "next/server";
import { z } from "zod";
import { createCustomerSession } from "@/lib/auth/customerAccount";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const input = loginSchema.parse(await request.json());
    const user = await prisma.user.findUnique({
      include: { customer: true },
      where: { email: input.email.trim().toLowerCase() }
    });

    if (!user || user.status !== "ACTIVE" || !verifyPassword(input.password, user.passwordHash) || !user.customer) {
      return NextResponse.json({ message: "Invalid email or password." }, { status: 401 });
    }

    return NextResponse.json({
      message: "Logged in successfully.",
      session: createCustomerSession(user)
    });
  } catch (error) {
    const message = error instanceof z.ZodError ? "Enter a valid email and password." : "Unable to login right now.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
