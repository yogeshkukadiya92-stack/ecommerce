import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/apiAuth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireAdminPermission(request, "customers:read");

  if (auth.response) {
    return auth.response;
  }

  const reviews = await prisma.review.findMany({
    include: {
      customer: {
        select: {
          email: true,
          firstName: true,
          lastName: true
        }
      },
      product: {
        select: {
          name: true,
          slug: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 300
  });

  return NextResponse.json({
    data: reviews.map((review) => ({
      body: review.body,
      createdAt: review.createdAt.toISOString(),
      customerEmail: review.customer.email,
      customerName: `${review.customer.firstName} ${review.customer.lastName}`.trim(),
      id: review.id,
      isVerifiedPurchase: review.isVerifiedPurchase,
      productName: review.product.name,
      rating: review.rating,
      status: review.status,
      title: review.title
    }))
  });
}

const updateSchema = z.object({
  id: z.string().regex(/^[a-f0-9]{24}$/i),
  status: z.enum(["PENDING", "APPROVED", "REJECTED"])
});

export async function PATCH(request: Request) {
  const auth = requireAdminPermission(request, "orders:write");

  if (auth.response) {
    return auth.response;
  }

  try {
    const input = updateSchema.parse(await request.json());
    await prisma.review.update({
      data: {
        status: input.status
      },
      where: {
        id: input.id
      }
    });

    return NextResponse.json({ message: `Review marked ${input.status.toLowerCase()}.` });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Select a valid review status." }, { status: 400 });
    }

    return NextResponse.json({ message: "Review not found." }, { status: 404 });
  }
}
