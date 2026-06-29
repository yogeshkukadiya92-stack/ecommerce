import { orders as seedOrders } from "@/mock/orders";
import { customers } from "@/mock/customers";
import type { CartLineItem } from "@/types/cart";
import type { CheckoutOrder, PlaceOrderInput } from "@/types/checkout";
import { processMockCheckoutPayment } from "@/lib/services/payment";

const ORDERS_KEY = "fitsupplement.orders.v1";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function seedCheckoutOrders(): CheckoutOrder[] {
  return seedOrders.map((order) => ({
    billingAddress: {
      addressLine1: order.billingAddress.line1,
      addressLine2: order.billingAddress.line2,
      city: order.billingAddress.city,
      country: order.billingAddress.country,
      email: customers.find((customer) => customer.id === order.customerId)?.email ?? "",
      fullName: `${order.billingAddress.firstName} ${order.billingAddress.lastName}`,
      phone: order.billingAddress.phone,
      pincode: order.billingAddress.postalCode,
      state: order.billingAddress.state
    },
    couponCode: order.couponCode,
    createdAt: order.createdAt,
    customerId: order.customerId,
    deliveryMethod: "standard",
    discountAmount: order.discountAmount,
    id: order.id,
    items: order.items.map((item) => ({
      addedAt: order.createdAt,
      lineId: item.id,
      productId: item.productId,
      productName: item.productName,
      productSlug: item.productName.toLowerCase().replace(/\s+/g, "-"),
      purchaseType: "one-time",
      quantity: item.quantity,
      sku: item.sku,
      total: item.totalAmount,
      unitPrice: item.unitPrice,
      variantId: item.productVariantId
    })),
    orderNumber: order.orderNumber,
    payment: {
      method: "upi",
      provider: order.payment?.provider ?? "razorpay",
      status: order.payment?.status === "paid" ? "paid" : "pending",
      transactionId: order.payment?.providerPaymentId
    },
    shippingAddress: {
      addressLine1: order.shippingAddress.line1,
      addressLine2: order.shippingAddress.line2,
      city: order.shippingAddress.city,
      country: order.shippingAddress.country,
      email: customers.find((customer) => customer.id === order.customerId)?.email ?? "",
      fullName: `${order.shippingAddress.firstName} ${order.shippingAddress.lastName}`,
      phone: order.shippingAddress.phone,
      pincode: order.shippingAddress.postalCode,
      state: order.shippingAddress.state
    },
    shippingAmount: order.shippingAmount,
    status: order.status,
    statusHistory: [
      {
        at: order.createdAt,
        note: "Imported sample order.",
        status: order.status
      }
    ],
    subtotal: order.subtotal,
    taxAmount: order.taxAmount,
    totalAmount: order.totalAmount
  }));
}

export function readLocalOrders() {
  if (!canUseStorage()) {
    return seedCheckoutOrders();
  }

  const rawOrders = window.localStorage.getItem(ORDERS_KEY);

  if (!rawOrders) {
    const seeded = seedCheckoutOrders();
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(rawOrders);
    return Array.isArray(parsed) ? (parsed as CheckoutOrder[]) : seedCheckoutOrders();
  } catch {
    return seedCheckoutOrders();
  }
}

function writeLocalOrders(orders: CheckoutOrder[]) {
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  window.dispatchEvent(new CustomEvent("fitsupplement:orders", { detail: orders }));
}

export async function createMockCheckoutOrder(input: PlaceOrderInput) {
  const createdAt = new Date().toISOString();
  const orderNumber = `FS-${Math.floor(100000 + Math.random() * 900000)}`;
  const payment = await processMockCheckoutPayment({
    amount: input.totals.grandTotal,
    method: input.paymentMethod,
    orderNumber
  });
  const status = payment.status === "paid" ? "paid" : "confirmed";
  const items = input.items.map((item: CartLineItem) => ({
    ...item,
    total: item.unitPrice * item.quantity
  }));
  const order: CheckoutOrder = {
    billingAddress: input.address,
    couponCode: input.couponCode,
    createdAt,
    customerId: input.customerId,
    deliveryMethod: input.deliveryMethod,
    discountAmount: input.totals.couponDiscount,
    id: `ord-${Date.now()}`,
    items,
    orderNumber,
    payment: {
      method: input.paymentMethod,
      provider: "cod",
      status: payment.status,
      transactionId: payment.transactionId
    },
    shippingAddress: input.address,
    shippingAmount: input.totals.shipping,
    status,
    statusHistory: [
      {
        at: createdAt,
        note: "Order created from checkout.",
        status: "pending"
      },
      {
        at: createdAt,
        note: payment.message,
        status
      }
    ],
    subtotal: input.totals.subtotal,
    taxAmount: input.totals.tax,
    totalAmount: input.totals.grandTotal
  };

  writeLocalOrders([order, ...readLocalOrders()]);
  return order;
}

export function createPendingCheckoutOrder(input: PlaceOrderInput & {
  provider?: "razorpay" | "cashfree" | "stripe";
  providerOrderId?: string;
}) {
  const createdAt = new Date().toISOString();
  const orderNumber = `FS-${Math.floor(100000 + Math.random() * 900000)}`;
  const items = input.items.map((item: CartLineItem) => ({
    ...item,
    total: item.unitPrice * item.quantity
  }));
  const order: CheckoutOrder = {
    billingAddress: input.address,
    couponCode: input.couponCode,
    createdAt,
    customerId: input.customerId,
    deliveryMethod: input.deliveryMethod,
    discountAmount: input.totals.couponDiscount,
    id: `ord-${Date.now()}`,
    items,
    orderNumber,
    payment: {
      method: input.paymentMethod,
      provider: input.provider ?? "razorpay",
      providerOrderId: input.providerOrderId,
      status: "pending"
    },
    shippingAddress: input.address,
    shippingAmount: input.totals.shipping,
    status: "pending",
    statusHistory: [
      {
        at: createdAt,
        note: "Order created and waiting for payment.",
        status: "pending"
      }
    ],
    subtotal: input.totals.subtotal,
    taxAmount: input.totals.tax,
    totalAmount: input.totals.grandTotal
  };

  writeLocalOrders([order, ...readLocalOrders()]);
  return order;
}

export function updateLocalOrderPayment(
  orderNumber: string,
  payment: Partial<CheckoutOrder["payment"]>,
  input: {
    note: string;
    status: CheckoutOrder["status"];
  }
) {
  const updatedAt = new Date().toISOString();
  const orders = readLocalOrders();
  const nextOrders = orders.map((order) => {
    if (order.orderNumber !== orderNumber) {
      return order;
    }

    return {
      ...order,
      payment: {
        ...order.payment,
        ...payment
      },
      status: input.status,
      statusHistory: [
        {
          at: updatedAt,
          note: input.note,
          status: input.status
        },
        ...order.statusHistory
      ]
    };
  });

  writeLocalOrders(nextOrders);
  return nextOrders.find((order) => order.orderNumber === orderNumber);
}

export function getLocalOrderByNumber(orderNumber: string) {
  return readLocalOrders().find((order) => order.orderNumber === orderNumber);
}
