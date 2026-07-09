import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/admin/apiAuth";
import { prisma } from "@/lib/db/prisma";

export async function GET(request: Request) {
  const auth = requireAdminPermission(request, "dashboard:read");

  if (auth.response) {
    return auth.response;
  }

  const [
    attendance,
    brands,
    categories,
    customers,
    leads,
    orders,
    products,
    variants,
    warehouses
  ] = await Promise.all([
    prisma.attendanceEntry.count(),
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
      attendance,
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
