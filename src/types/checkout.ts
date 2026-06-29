import type { CartLineItem } from "./cart";
import type { OrderStatus } from "./models";

export type CheckoutMode = "guest" | "login";

export type CheckoutAddress = {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  country: string;
  email: string;
  fullName: string;
  phone: string;
  pincode: string;
  state: string;
};

export type DeliveryMethod = "standard" | "express";

export type PaymentMethod = "upi" | "card" | "net_banking" | "wallet" | "cod";

export type CheckoutOrderItem = CartLineItem & {
  total: number;
};

export type CheckoutOrder = {
  billingAddress: CheckoutAddress;
  couponCode?: string;
  createdAt: string;
  customerId?: string;
  deliveryMethod: DeliveryMethod;
  discountAmount: number;
  id: string;
  items: CheckoutOrderItem[];
  orderNumber: string;
  payment: {
    method: PaymentMethod;
    provider: "mock";
    status: "pending" | "paid" | "failed" | "cod_pending";
    transactionId?: string;
  };
  shippingAddress: CheckoutAddress;
  shippingAmount: number;
  status: OrderStatus;
  statusHistory: Array<{
    at: string;
    note: string;
    status: OrderStatus;
  }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
};

export type PlaceOrderInput = {
  address: CheckoutAddress;
  couponCode?: string;
  customerId?: string;
  deliveryMethod: DeliveryMethod;
  items: CartLineItem[];
  paymentMethod: PaymentMethod;
  totals: {
    couponDiscount: number;
    grandTotal: number;
    shipping: number;
    subtotal: number;
    tax: number;
  };
};
