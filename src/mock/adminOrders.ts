import { advancedWarehouses, inventoryBatchRecords } from "@/mock/adminInventory";
import { customers } from "@/mock/customers";
import { products } from "@/mock/products";
import type { AdminOrder, AdminOrderItem } from "@/types/orderOps";

const now = "2026-06-29T09:00:00.000Z";
const mumbaiWarehouse = advancedWarehouses[0];
const aarav = customers[0];
const nisha = customers[1] ?? customers[0];
const aaravAddress = aarav.addresses[0];
const nishaAddress = nisha.addresses[0] ?? aaravAddress;

function itemFromVariant(input: {
  id: string;
  productId: string;
  quantity: number;
  totalAmount: number;
  unitPrice: number;
  variantId: string;
}): AdminOrderItem {
  const product = products.find((entry) => entry.id === input.productId) ?? products[0];
  const variant = product.variants.find((entry) => entry.id === input.variantId) ?? product.variants[0];
  const batch = inventoryBatchRecords.find((entry) => entry.variantId === input.variantId);

  return {
    batchId: batch?.id,
    batchNumber: batch?.batchNumber,
    gstRate: 18,
    hsnCode: "21069099",
    id: input.id,
    productId: input.productId,
    productName: product.name,
    quantity: input.quantity,
    sku: variant.sku,
    totalAmount: input.totalAmount,
    unitPrice: input.unitPrice,
    variantId: input.variantId,
    variantLabel: [variant.flavor, variant.size].filter(Boolean).join(" / ") || variant.sku
  };
}

export const adminOrders: AdminOrder[] = [
  {
    billingAddress: aaravAddress,
    codConfirmed: true,
    codRisk: "low",
    couponCode: "FIT300",
    currency: "INR",
    customerEmail: aarav.email,
    customerId: aarav.id,
    customerName: `${aarav.firstName} ${aarav.lastName}`,
    customerPhone: aarav.phone ?? "9999999999",
    discountAmount: 300,
    id: "ord-1001",
    internalNotes: [
      {
        adminName: "Ops Lead",
        at: "2026-06-29T08:55:00.000Z",
        id: "note-1001",
        note: "Priority protein stack order. Verify batch label before packing."
      }
    ],
    invoiceNumber: "INV-FS-1001",
    items: [
      itemFromVariant({
        id: "item-1001-1",
        productId: "prod-whey-elite",
        quantity: 1,
        totalAmount: 2849,
        unitPrice: 2999,
        variantId: "var-whey-choco-1kg"
      }),
      itemFromVariant({
        id: "item-1001-2",
        productId: "prod-creatine-mono",
        quantity: 1,
        totalAmount: 949,
        unitPrice: 1099,
        variantId: "var-creatine-250g"
      })
    ],
    orderNumber: "FS-1001",
    payment: {
      amount: 3798,
      method: "prepaid",
      provider: "razorpay",
      providerPaymentId: "pay_mock_1001",
      status: "paid"
    },
    placedAt: now,
    return: {
      refundStatus: "not_started",
      status: "none"
    },
    shipment: {
      carrier: "shiprocket",
      estimatedDelivery: "2026-07-03",
      serviceabilityMessage: `Serviceable from ${mumbaiWarehouse.name}.`,
      status: "pending",
      trackingNumber: "SR-MOCK-1001"
    },
    shippingAddress: aaravAddress,
    shippingAmount: 0,
    status: "confirmed",
    subtotal: 4098,
    taxAmount: 0,
    timeline: [
      {
        actor: "system",
        at: "2026-06-29T08:40:00.000Z",
        id: "tl-1001-1",
        note: "Razorpay payment captured.",
        status: "payment",
        title: "Payment received"
      },
      {
        actor: "Ops Lead",
        at: "2026-06-29T08:45:00.000Z",
        id: "tl-1001-2",
        note: "Order reviewed and ready for fulfillment.",
        status: "confirmed",
        title: "Order confirmed"
      }
    ],
    totalAmount: 3798,
    communicationLog: [
      {
        at: "2026-06-29T08:46:00.000Z",
        channel: "email",
        id: "comm-1001",
        message: "Order confirmation sent.",
        status: "delivered"
      }
    ]
  },
  {
    billingAddress: nishaAddress,
    codConfirmed: false,
    codRisk: "medium",
    currency: "INR",
    customerEmail: nisha.email,
    customerId: nisha.id,
    customerName: `${nisha.firstName} ${nisha.lastName}`,
    customerPhone: nisha.phone ?? "9888888888",
    discountAmount: 0,
    id: "ord-1002",
    internalNotes: [],
    items: [
      itemFromVariant({
        id: "item-1002-1",
        productId: "prod-mass-gainer",
        quantity: 1,
        totalAmount: 2499,
        unitPrice: 2499,
        variantId: "var-gainer-kulfi-3kg"
      })
    ],
    orderNumber: "FS-1002",
    payment: {
      amount: 2499,
      method: "cod",
      provider: "cod",
      status: "cod_pending"
    },
    placedAt: "2026-06-29T07:20:00.000Z",
    return: {
      refundStatus: "not_started",
      status: "none"
    },
    shipment: {
      carrier: "delhivery",
      serviceabilityMessage: "COD verification pending before label creation.",
      status: "pending"
    },
    shippingAddress: nishaAddress,
    shippingAmount: 49,
    status: "pending",
    subtotal: 2499,
    taxAmount: 0,
    timeline: [
      {
        actor: "system",
        at: "2026-06-29T07:21:00.000Z",
        id: "tl-1002-1",
        note: "COD order needs phone confirmation.",
        status: "pending",
        title: "Order placed"
      }
    ],
    totalAmount: 2548,
    communicationLog: [
      {
        at: "2026-06-29T07:22:00.000Z",
        channel: "sms",
        id: "comm-1002",
        message: "COD verification SMS queued.",
        status: "queued"
      }
    ]
  },
  {
    billingAddress: aaravAddress,
    codConfirmed: true,
    codRisk: "low",
    currency: "INR",
    customerEmail: aarav.email,
    customerId: aarav.id,
    customerName: `${aarav.firstName} ${aarav.lastName}`,
    customerPhone: aarav.phone ?? "9999999999",
    discountAmount: 120,
    id: "ord-1003",
    internalNotes: [],
    invoiceNumber: "INV-FS-1003",
    items: [
      itemFromVariant({
        id: "item-1003-1",
        productId: "prod-creatine-mono",
        quantity: 2,
        totalAmount: 2058,
        unitPrice: 1099,
        variantId: "var-creatine-250g"
      })
    ],
    orderNumber: "FS-1003",
    payment: {
      amount: 2058,
      method: "prepaid",
      provider: "cashfree",
      providerPaymentId: "cf_mock_1003",
      status: "paid"
    },
    placedAt: "2026-06-28T11:10:00.000Z",
    return: {
      refundStatus: "not_started",
      status: "none"
    },
    shipment: {
      carrier: "shiprocket",
      estimatedDelivery: "2026-07-02",
      serviceabilityMessage: "Tracking active.",
      status: "in_transit",
      trackingNumber: "SR-MOCK-1003"
    },
    shippingAddress: aaravAddress,
    shippingAmount: 0,
    status: "shipped",
    subtotal: 2198,
    taxAmount: 0,
    timeline: [
      {
        actor: "Ops Lead",
        at: "2026-06-28T12:00:00.000Z",
        id: "tl-1003-1",
        note: "FEFO batch reserved and packed.",
        status: "inventory",
        title: "Stock reserved"
      },
      {
        actor: "Ops Lead",
        at: "2026-06-28T16:00:00.000Z",
        id: "tl-1003-2",
        note: "Courier pickup completed.",
        status: "shipped",
        title: "Order shipped"
      }
    ],
    totalAmount: 2058,
    communicationLog: []
  },
  {
    billingAddress: nishaAddress,
    codConfirmed: true,
    codRisk: "low",
    couponCode: "WELCOME10",
    currency: "INR",
    customerEmail: nisha.email,
    customerId: nisha.id,
    customerName: `${nisha.firstName} ${nisha.lastName}`,
    customerPhone: nisha.phone ?? "9888888888",
    discountAmount: 250,
    id: "ord-1004",
    internalNotes: [
      {
        adminName: "Support",
        at: "2026-06-29T06:30:00.000Z",
        id: "note-1004",
        note: "Customer reported incorrect flavor. Review unboxing photo before approval."
      }
    ],
    invoiceNumber: "INV-FS-1004",
    items: [
      itemFromVariant({
        id: "item-1004-1",
        productId: "prod-whey-elite",
        quantity: 1,
        totalAmount: 2749,
        unitPrice: 2999,
        variantId: "var-whey-choco-1kg"
      })
    ],
    orderNumber: "FS-1004",
    payment: {
      amount: 2749,
      method: "prepaid",
      provider: "stripe",
      providerPaymentId: "pi_mock_1004",
      status: "paid"
    },
    placedAt: "2026-06-24T10:45:00.000Z",
    return: {
      reason: "Wrong flavor received",
      refundStatus: "pending",
      requestedAt: "2026-06-29T06:15:00.000Z",
      status: "requested"
    },
    shipment: {
      carrier: "bluedart",
      estimatedDelivery: "2026-06-27",
      serviceabilityMessage: "Delivered.",
      status: "delivered",
      trackingNumber: "BD-MOCK-1004"
    },
    shippingAddress: nishaAddress,
    shippingAmount: 0,
    status: "return_requested",
    subtotal: 2999,
    taxAmount: 0,
    timeline: [
      {
        actor: "system",
        at: "2026-06-27T18:20:00.000Z",
        id: "tl-1004-1",
        note: "Shipment delivered to customer.",
        status: "delivered",
        title: "Delivered"
      },
      {
        actor: "customer",
        at: "2026-06-29T06:15:00.000Z",
        id: "tl-1004-2",
        note: "Wrong flavor received",
        status: "return_requested",
        title: "Return requested"
      }
    ],
    totalAmount: 2749,
    communicationLog: [
      {
        at: "2026-06-29T06:16:00.000Z",
        channel: "email",
        id: "comm-1004",
        message: "Return request acknowledgement sent.",
        status: "sent"
      }
    ]
  }
];

export const adminOrderReports = {
  courierPerformance: [
    { carrier: "Shiprocket", delivered: 82, ndr: 4, rto: 2 },
    { carrier: "Delhivery", delivered: 64, ndr: 7, rto: 5 },
    { carrier: "BlueDart", delivered: 38, ndr: 1, rto: 1 }
  ],
  returnReasons: [
    { count: 8, reason: "Wrong flavor" },
    { count: 5, reason: "Damaged packaging" },
    { count: 3, reason: "Changed mind" }
  ]
};
