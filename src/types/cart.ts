export type PurchaseType = "one-time" | "subscribe";

export type SubscriptionFrequency = "15 days" | "30 days" | "45 days" | "60 days";

export type AddToCartPayload = {
  addedAt: string;
  brandName?: string;
  brandId?: string;
  bundleId?: string;
  categorySlug?: string;
  discountPercent?: number;
  imageUrl?: string;
  mrp?: number;
  productId: string;
  productName: string;
  productSlug: string;
  purchaseType: PurchaseType;
  quantity: number;
  sku: string;
  subscriptionFrequency?: SubscriptionFrequency;
  unitPrice: number;
  variantLabel?: string;
  variantId: string;
};

export type CartLineItem = AddToCartPayload & {
  lineId: string;
};

export type CartTotals = {
  couponCode?: string;
  couponDiscount: number;
  freeShippingThreshold: number;
  grandTotal: number;
  loyaltyEarnedPoints: number;
  loyaltyRedeemedAmount: number;
  itemCount: number;
  mrpTotal: number;
  productDiscount: number;
  shipping: number;
  subtotal: number;
  subscriptionDiscount: number;
  tax: number;
};

export type CouponResult = {
  code?: string;
  discount: number;
  freeShipping?: boolean;
  message: string;
  ok: boolean;
};
