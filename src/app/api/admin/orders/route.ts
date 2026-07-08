import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    include: {
      customer: true,
      items: true,
      payment: true,
      shipment: true
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 200
  });

  return NextResponse.json({
    data: orders.map((order) => ({
      createdAt: order.createdAt.toISOString(),
      customerEmail: order.customer?.email ?? "",
      customerName: order.customer ? `${order.customer.firstName} ${order.customer.lastName}`.trim() : "Guest",
      discountAmount: order.discountAmount,
      id: order.id,
      itemCount: order.items.reduce((total, item) => total + item.quantity, 0),
      items: order.items.map((item) => ({
        id: item.id,
        productName: item.productName,
        quantity: item.quantity,
        sku: item.sku,
        totalAmount: item.totalAmount,
        unitPrice: item.unitPrice
      })),
      orderNumber: order.orderNumber,
      paymentProvider: order.payment?.provider ?? "COD",
      paymentStatus: order.payment?.status ?? (order.status === "PENDING" ? "PENDING" : "COD"),
      shippingAmount: order.shippingAmount,
      status: order.status,
      subtotal: order.subtotal,
      totalAmount: order.totalAmount,
      trackingNumber: order.shipment?.trackingNumber ?? null
    })
    )
  });
}
