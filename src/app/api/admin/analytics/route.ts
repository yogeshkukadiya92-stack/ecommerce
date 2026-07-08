import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const [orders, productCount, activeProductCount, customerCount, variants, reviewCount, couponCount] = await Promise.all([
    prisma.order.findMany({
      include: {
        items: {
          select: {
            productName: true,
            quantity: true,
            sku: true,
            totalAmount: true
          }
        }
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 1000
    }),
    prisma.product.count(),
    prisma.product.count({ where: { status: "ACTIVE" } }),
    prisma.customer.count(),
    prisma.productVariant.findMany({
      select: {
        sku: true,
        stock: true
      }
    }),
    prisma.review.count(),
    prisma.coupon.count()
  ]);

  const countedOrders = orders.filter((order) => order.status !== "CANCELLED" && order.status !== "REFUNDED");
  const revenue = countedOrders.reduce((total, order) => total + order.totalAmount, 0);
  const ordersByStatus: Record<string, number> = {};

  for (const order of orders) {
    ordersByStatus[order.status] = (ordersByStatus[order.status] ?? 0) + 1;
  }

  const productSales = new Map<string, { name: string; quantity: number; revenue: number }>();

  for (const order of countedOrders) {
    for (const item of order.items) {
      const existing = productSales.get(item.sku) ?? { name: item.productName, quantity: 0, revenue: 0 };
      existing.quantity += item.quantity;
      existing.revenue += item.totalAmount;
      productSales.set(item.sku, existing);
    }
  }

  const topProducts = [...productSales.entries()]
    .map(([sku, value]) => ({ sku, ...value }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  const last30Days = new Date();
  last30Days.setDate(last30Days.getDate() - 30);
  const recentOrders = countedOrders.filter((order) => order.createdAt >= last30Days);

  return NextResponse.json({
    data: {
      activeProductCount,
      averageOrderValue: countedOrders.length ? Math.round(revenue / countedOrders.length) : 0,
      couponCount,
      customerCount,
      lowStockCount: variants.filter((variant) => variant.stock <= 5).length,
      orderCount: orders.length,
      ordersByStatus,
      productCount,
      revenue,
      revenueLast30Days: recentOrders.reduce((total, order) => total + order.totalAmount, 0),
      reviewCount,
      topProducts,
      unitsInStock: variants.reduce((total, variant) => total + variant.stock, 0)
    }
  });
}
