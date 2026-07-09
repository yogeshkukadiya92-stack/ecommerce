import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/apiAuth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireAdminPermission(request, "inventory:read");

  if (auth.response) {
    return auth.response;
  }

  const variants = await prisma.productVariant.findMany({
    include: {
      product: {
        select: {
          name: true,
          slug: true,
          status: true
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    },
    take: 500
  });

  return NextResponse.json({
    data: variants.map((variant) => ({
      id: variant.id,
      isActive: variant.isActive,
      mrp: variant.mrp,
      productName: variant.product.name,
      productSlug: variant.product.slug,
      productStatus: variant.product.status,
      sellingPrice: variant.sellingPrice,
      size: variant.size,
      sku: variant.sku,
      stock: variant.stock,
      updatedAt: variant.updatedAt.toISOString()
    }))
  });
}

const adjustSchema = z.object({
  reason: z.string().trim().max(200).optional(),
  stock: z.number().int().min(0),
  variantId: z.string().regex(/^[a-f0-9]{24}$/i)
});

export async function PATCH(request: Request) {
  const auth = requireAdminPermission(request, "stock:adjust");

  if (auth.response) {
    return auth.response;
  }

  try {
    const input = adjustSchema.parse(await request.json());
    const variant = await prisma.productVariant.update({
      data: {
        stock: input.stock
      },
      where: {
        id: input.variantId
      }
    });

    return NextResponse.json({
      message: `Stock for ${variant.sku} set to ${variant.stock}.`,
      stock: variant.stock
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Enter a valid stock quantity." }, { status: 400 });
    }

    return NextResponse.json({ message: "Variant not found." }, { status: 404 });
  }
}
