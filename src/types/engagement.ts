import type { ID } from "./models";

export type ReviewModerationStatus = "pending" | "approved" | "rejected" | "reported";
export type QuestionModerationStatus = "pending" | "answered" | "hidden" | "reported";
export type CustomerSegment = "new" | "repeat" | "VIP" | "inactive" | "COD risk" | "high return rate";
export type MarketingChannel = "email" | "SMS" | "WhatsApp";
export type AutomationTrigger =
  | "abandoned_cart"
  | "order_confirmation"
  | "shipping_update"
  | "delivered_message"
  | "review_request"
  | "reorder_reminder"
  | "subscription_renewal_reminder"
  | "back_in_stock_alert"
  | "price_drop_alert"
  | "birthday_coupon"
  | "win_back_campaign";

export interface ProductReview {
  id: ID;
  productId: ID;
  productName: string;
  customerId: ID;
  customerName: string;
  orderId?: ID;
  rating: 1 | 2 | 3 | 4 | 5;
  tasteRating: 1 | 2 | 3 | 4 | 5;
  mixabilityRating: 1 | 2 | 3 | 4 | 5;
  valueRating: 1 | 2 | 3 | 4 | 5;
  title: string;
  comment: string;
  tags: string[];
  mediaPlaceholder: string;
  isVerifiedPurchase: boolean;
  status: ReviewModerationStatus;
  adminReply?: string;
  reportedReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuestionThread {
  id: ID;
  productId: ID;
  productName: string;
  customerId?: ID;
  customerName: string;
  question: string;
  answer?: string;
  answeredBy?: string;
  isAdminAnswered: boolean;
  status: QuestionModerationStatus;
  createdAt: string;
  answeredAt?: string;
}

export interface CrmCustomerProfile {
  customerId: ID;
  lifetimeValue: number;
  averageOrderValue: number;
  repeatPurchaseCount: number;
  lastOrderDate?: string;
  wishlistProductIds: ID[];
  reviewIds: ID[];
  supportNotes: Array<{
    id: ID;
    note: string;
    author: string;
    createdAt: string;
  }>;
  segments: CustomerSegment[];
  returnRatePercent: number;
  codRiskScore: "low" | "medium" | "high";
}

export interface MarketingAutomationRule {
  id: ID;
  name: string;
  trigger: AutomationTrigger;
  channels: MarketingChannel[];
  status: "draft" | "active" | "paused";
  audienceSegment: CustomerSegment | "all";
  delayHours: number;
  sentCount: number;
  openRatePercent?: number;
  clickRatePercent?: number;
  revenueAttributed?: number;
  lastRunAt?: string;
}

export interface AbandonedCartLead {
  id: ID;
  customerId?: ID;
  customerName: string;
  email: string;
  phone?: string;
  cartValue: number;
  itemCount: number;
  lastActivityAt: string;
  channelsQueued: MarketingChannel[];
}

export interface ProductAlertSignup {
  id: ID;
  productId: ID;
  productName: string;
  customerEmail: string;
  type: "back_in_stock" | "price_drop";
  targetPrice?: number;
  channel: MarketingChannel;
  status: "active" | "sent" | "cancelled";
  createdAt: string;
}
