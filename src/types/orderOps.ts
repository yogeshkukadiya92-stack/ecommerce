import type { Address, CurrencyCode, ShippingProvider } from "@/types/models";

export type AdminOrderStatus =
  | "pending"
  | "confirmed"
  | "packed"
  | "shipped"
  | "out_for_delivery"
  | "delivered"
  | "cancelled"
  | "return_requested"
  | "returned"
  | "refunded"
  | "rto";

export type AdminPaymentStatus = "pending" | "paid" | "failed" | "refunded" | "cod_pending";

export type AdminShipmentStatus =
  | "pending"
  | "serviceable"
  | "label_created"
  | "picked_up"
  | "in_transit"
  | "out_for_delivery"
  | "delivered"
  | "ndr"
  | "rto";

export type ReturnStatus =
  | "none"
  | "requested"
  | "approved"
  | "rejected"
  | "pickup_scheduled"
  | "received"
  | "qc_checked"
  | "restocked"
  | "damaged"
  | "quarantined"
  | "refunded";

export type PaymentMode = "prepaid" | "cod";
export type RefundMethod = "original_payment" | "upi" | "store_credit" | "manual";
export type ReturnQcDecision = "restock" | "damaged" | "quarantine";

export type AdminOrderItem = {
  batchId?: string;
  batchNumber?: string;
  gstRate: number;
  hsnCode: string;
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  sku: string;
  totalAmount: number;
  unitPrice: number;
  variantId: string;
  variantLabel: string;
};

export type OrderTimelineEntry = {
  actor: string;
  at: string;
  id: string;
  note?: string;
  status: AdminOrderStatus | AdminShipmentStatus | ReturnStatus | "payment" | "inventory" | "invoice";
  title: string;
};

export type InternalNote = {
  adminName: string;
  at: string;
  id: string;
  note: string;
};

export type CommunicationLogEntry = {
  at: string;
  channel: "email" | "sms" | "whatsapp" | "phone";
  id: string;
  message: string;
  status: "queued" | "sent" | "delivered" | "failed";
};

export type AdminPaymentSnapshot = {
  amount: number;
  method: PaymentMode;
  provider: "razorpay" | "stripe" | "cashfree" | "cod" | "manual";
  providerPaymentId?: string;
  status: AdminPaymentStatus;
};

export type AdminShipmentSnapshot = {
  carrier: ShippingProvider | "bluedart";
  estimatedDelivery?: string;
  ndrReason?: string;
  serviceabilityMessage?: string;
  status: AdminShipmentStatus;
  trackingNumber?: string;
};

export type AdminReturnSnapshot = {
  approvedAt?: string;
  pickupReference?: string;
  qcDecision?: ReturnQcDecision;
  reason?: string;
  refundMethod?: RefundMethod;
  refundStatus: "not_started" | "pending" | "processed" | "failed";
  requestedAt?: string;
  status: ReturnStatus;
};

export type AdminOrder = {
  billingAddress: Address;
  codConfirmed: boolean;
  codRisk: "low" | "medium" | "high";
  couponCode?: string;
  currency: CurrencyCode;
  customerEmail: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  discountAmount: number;
  id: string;
  internalNotes: InternalNote[];
  invoiceNumber?: string;
  items: AdminOrderItem[];
  orderNumber: string;
  payment: AdminPaymentSnapshot;
  placedAt: string;
  return: AdminReturnSnapshot;
  shipment: AdminShipmentSnapshot;
  shippingAddress: Address;
  shippingAmount: number;
  status: AdminOrderStatus;
  subtotal: number;
  taxAmount: number;
  timeline: OrderTimelineEntry[];
  totalAmount: number;
  communicationLog: CommunicationLogEntry[];
};

export type OrderFilters = {
  customer: string;
  dateFrom: string;
  dateTo: string;
  orderId: string;
  orderStatus: "all" | AdminOrderStatus;
  paymentMode: "all" | PaymentMode;
  paymentStatus: "all" | AdminPaymentStatus;
  returnStatus: "all" | ReturnStatus;
  shipmentStatus: "all" | AdminShipmentStatus;
};
