import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { CheckoutAddress } from "@/types/checkout";

function parseAddress(address: unknown): CheckoutAddress | null {
  if (!address || typeof address !== "object") {
    return null;
  }

  const value = address as Partial<CheckoutAddress>;
  return {
    addressLine1: value.addressLine1 ?? "",
    addressLine2: value.addressLine2,
    city: value.city ?? "",
    country: value.country ?? "India",
    email: value.email ?? "",
    fullName: value.fullName ?? "",
    phone: value.phone ?? "",
    pincode: value.pincode ?? "",
    state: value.state ?? ""
  };
}

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
      customerPhone: order.customer?.phone ?? parseAddress(order.shippingAddress)?.phone ?? "",
      billingAddress: parseAddress(order.billingAddress),
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
      shippingAddress: parseAddress(order.shippingAddress),
      shippingAmount: order.shippingAmount,
      status: order.status,
      subtotal: order.subtotal,
      totalAmount: order.totalAmount,
      trackingNumber: order.shipment?.trackingNumber ?? null
    })
    )
  });
}
