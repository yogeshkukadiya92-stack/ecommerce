import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/apiAuth";
import { prisma } from "@/lib/db/prisma";

const couponInputSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[A-Za-z0-9-]+$/, "Use letters, numbers, and hyphens only."),
  endsAt: z.string().optional(),
  minimumOrderAmount: z.number().min(0).optional(),
  type: z.enum(["PERCENTAGE", "FIXED_AMOUNT", "FREE_SHIPPING"]),
  usageLimit: z.number().int().positive().optional(),
  value: z.number().min(0)
});

export async function GET(request: Request) {
  const auth = requireAdminPermission(request, "coupon:create");

  if (auth.response) {
    return auth.response;
  }

  const coupons = await prisma.coupon.findMany({
    include: {
      orders: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    }
  });

  return NextResponse.json({
    data: coupons.map((coupon) => ({
      code: coupon.code,
      endsAt: coupon.endsAt?.toISOString() ?? null,
      id: coupon.id,
      isActive: coupon.isActive,
      minimumOrderAmount: coupon.minimumOrderAmount,
      startsAt: coupon.startsAt.toISOString(),
      timesUsed: coupon.orders.length,
      type: coupon.type,
      usageLimit: coupon.usageLimit,
      value: coupon.value
    }))
  });
}

export async function POST(request: Request) {
  const auth = requireAdminPermission(request, "coupon:create");

  if (auth.response) {
    return auth.response;
  }

  try {
    const input = couponInputSchema.parse(await request.json());

    if (input.type === "PERCENTAGE" && (input.value <= 0 || input.value > 90)) {
      return NextResponse.json({ message: "Percentage discount must be between 1 and 90." }, { status: 400 });
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: input.code.toUpperCase(),
        endsAt: input.endsAt ? new Date(input.endsAt) : undefined,
        isActive: true,
        minimumOrderAmount: input.minimumOrderAmount,
        startsAt: new Date(),
        type: input.type,
        usageLimit: input.usageLimit,
        value: input.value
      }
    });

    return NextResponse.json({ coupon: { code: coupon.code, id: coupon.id }, message: `Coupon ${coupon.code} created.` }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "A coupon with this code already exists." }, { status: 409 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message ?? "Enter valid coupon details." }, { status: 400 });
    }

    console.error("Coupon create failed", error);
    return NextResponse.json({ message: "Unable to create coupon right now." }, { status: 500 });
  }
}
