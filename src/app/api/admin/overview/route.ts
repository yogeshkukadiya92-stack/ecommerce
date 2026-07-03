import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const [
    brands,
    categories,
    customers,
    leads,
    orders,
    products,
    variants,
    warehouses
  ] = await Promise.all([
    prisma.brand.count(),
    prisma.category.count(),
    prisma.customer.count(),
    prisma.whatsAppLead.count(),
    prisma.order.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.warehouse.count()
  ]);

  return NextResponse.json({
    data: {
      brands,
      categories,
      customers,
      leads,
      orders,
      products,
      variants,
      warehouses
    },
    auth: {
      protectedBy: "admin session"
    }
  });
}
