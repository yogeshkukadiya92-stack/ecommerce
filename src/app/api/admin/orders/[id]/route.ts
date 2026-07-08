import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const updateSchema = z.object({
  status: z.enum(["PENDING", "CONFIRMED", "PACKED", "SHIPPED", "DELIVERED", "CANCELLED", "REFUNDED"])
});

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }

  try {
    const input = updateSchema.parse(await request.json());
    const order = await prisma.order.update({
      data: {
        status: input.status
      },
      where: {
        id
      }
    });

    return NextResponse.json({ message: `Order ${order.orderNumber} marked ${input.status}.`, status: order.status });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Select a valid order status." }, { status: 400 });
    }

    return NextResponse.json({ message: "Order not found." }, { status: 404 });
  }
}
