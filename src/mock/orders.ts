import type { Order } from "@/types";
import { customers } from "./customers";

const now = "2026-06-29T00:00:00.000Z";
const aaravAddress = customers[0].addresses[0];

export const orders: Order[] = [
  {
    id: "ord-1001",
    orderNumber: "FS-1001",
    customerId: "cust-aarav",
    status: "confirmed",
    currency: "INR",
    subtotal: 4098,
    discountAmount: 300,
    shippingAmount: 0,
    taxAmount: 0,
    totalAmount: 3798,
    couponCode: "FIT300",
    shippingAddress: aaravAddress,
    billingAddress: aaravAddress,
    items: [
      {
        id: "item-1001-1",
        orderId: "ord-1001",
        productId: "prod-whey-elite",
        productVariantId: "var-whey-choco-1kg",
        productName: "NutraForge Whey Elite",
        sku: "NF-WHEY-CHOCO-1KG",
        quantity: 1,
        unitPrice: 2999,
        discountAmount: 150,
        taxAmount: 0,
        totalAmount: 2849,
        createdAt: now,
        updatedAt: now
      },
      {
        id: "item-1001-2",
        orderId: "ord-1001",
        productId: "prod-creatine-mono",
        productVariantId: "var-creatine-250g",
        productName: "NutraForge Creatine Monohydrate",
        sku: "NF-CRTN-UNFL-250G",
        quantity: 1,
        unitPrice: 1099,
        discountAmount: 150,
        taxAmount: 0,
        totalAmount: 949,
        createdAt: now,
        updatedAt: now
      }
    ],
    payment: {
      id: "pay-1001",
      orderId: "ord-1001",
      provider: "razorpay",
      providerPaymentId: "pay_mock_1001",
      status: "paid",
      amount: 3798,
      currency: "INR",
      paidAt: now,
      createdAt: now,
      updatedAt: now
    },
    shipment: {
      id: "ship-1001",
      orderId: "ord-1001",
      provider: "shiprocket",
      trackingNumber: "SR-MOCK-1001",
      status: "ready_to_ship",
      createdAt: now,
      updatedAt: now
    },
    createdAt: now,
    updatedAt: now
  }
];
