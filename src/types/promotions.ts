import type { SubscriptionFrequency } from "@/types/cart";

export type DiscountType = "percentage" | "fixed_amount" | "free_shipping";
export type PromotionType =
  | "product_discount"
  | "category_discount"
  | "brand_discount"
  | "flash_sale"
  | "buy_x_get_y"
  | "bundle_discount"
  | "gift_with_purchase"
  | "free_shipping";

export type CustomerGroup = "all" | "first_time" | "vip" | "subscriber";

export type CouponRule = {
  abusePreventionNote: string;
  active: boolean;
  brandIds?: string[];
  categorySlugs?: string[];
  code: string;
  customerGroup: CustomerGroup;
  description: string;
  discountType: DiscountType;
  endDate?: string;
  firstOrderOnly: boolean;
  id: string;
  maximumDiscount?: number;
  minimumOrderValue: number;
  perCustomerLimit: number;
  productIds?: string[];
  startDate: string;
  usageCount: number;
  usageLimit: number;
  value: number;
};

export type CouponValidationInput = {
  customerGroup?: CustomerGroup;
  isFirstOrder?: boolean;
  now?: Date;
  usedByCustomer?: number;
};

export type PromotionRule = {
  active: boolean;
  description: string;
  discountType: DiscountType;
  endDate?: string;
  id: string;
  name: string;
  performance: {
    conversionRate: number;
    orders: number;
    revenue: number;
  };
  productIds?: string[];
  categorySlugs?: string[];
  brandIds?: string[];
  startDate: string;
  type: PromotionType;
  value: number;
};

export type BundleDeal = {
  active: boolean;
  bundlePrice: number;
  description: string;
  discountAmount: number;
  id: string;
  imageUrl: string;
  productIds: string[];
  slug: string;
  title: string;
};

export type CustomerSubscription = {
  addressId: string;
  customerId: string;
  discountPercent: number;
  frequency: SubscriptionFrequency;
  id: string;
  nextDeliveryDate: string;
  productId: string;
  status: "active" | "paused" | "cancelled" | "payment_retry";
  variantId: string;
};

export type LoyaltyPointEntry = {
  at: string;
  customerId: string;
  id: string;
  note: string;
  points: number;
  type: "purchase" | "review" | "referral" | "redeem" | "admin_adjustment" | "expiry";
};

export type ReferralRecord = {
  code: string;
  friendReward: string;
  id: string;
  landingLink: string;
  referredEmail: string;
  referrerCustomerId: string;
  referrerReward: string;
  status: "invited" | "signed_up" | "ordered" | "rewarded";
};
