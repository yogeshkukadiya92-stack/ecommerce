import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/apiAuth";
import { prisma } from "@/lib/db/prisma";

const updateSchema = z.object({
  isActive: z.boolean()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminPermission(request, "coupon:create");

  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;

  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ message: "Coupon not found." }, { status: 404 });
  }

  try {
    const input = updateSchema.parse(await request.json());
    const coupon = await prisma.coupon.update({
      data: {
        isActive: input.isActive
      },
      where: {
        id
      }
    });

    return NextResponse.json({ message: `Coupon ${coupon.code} ${coupon.isActive ? "activated" : "deactivated"}.` });
  } catch {
    return NextResponse.json({ message: "Coupon not found." }, { status: 404 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminPermission(request, "coupon:create");

  if (auth.response) {
    return auth.response;
  }

  const { id } = await params;

  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ message: "Coupon not found." }, { status: 404 });
  }

  try {
    await prisma.coupon.delete({ where: { id } });
    return NextResponse.json({ message: "Coupon deleted." });
  } catch {
    return NextResponse.json({ message: "Coupon not found." }, { status: 404 });
  }
}
