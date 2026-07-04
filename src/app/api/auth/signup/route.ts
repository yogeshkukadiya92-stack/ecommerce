import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createCustomerSession, splitFullName } from "@/lib/auth/customerAccount";
import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

const signupSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(120),
  password: z.string().min(6).max(128),
  phone: z.string().min(7).max(20).optional().or(z.literal(""))
});

export async function POST(request: Request) {
  try {
    const input = signupSchema.parse(await request.json());
    const email = input.email.trim().toLowerCase();
    const phone = input.phone?.trim() || undefined;
    const { firstName, lastName } = splitFullName(input.fullName);
    const user = await prisma.user.create({
      data: {
        customer: {
          create: {
            email,
            firstName,
            lastName,
            phone
          }
        },
        email,
        passwordHash: hashPassword(input.password),
        phone
      },
      include: { customer: true }
    });

    return NextResponse.json(
      {
        message: "Account created successfully.",
        session: createCustomerSession(user)
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "An account with this email or phone already exists." }, { status: 409 });
    }

    const message = error instanceof z.ZodError ? "Enter valid account details." : "Unable to create account right now.";
    return NextResponse.json({ message }, { status: 400 });
  }
}
