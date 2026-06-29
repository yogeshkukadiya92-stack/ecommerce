import { bundleDeals, couponRules, loyaltyPointEntries, promotionRules } from "@/mock/promotions";
import type { CartLineItem, CouponResult } from "@/types/cart";
import type { CouponRule, CouponValidationInput } from "@/types/promotions";

const defaultNow = new Date("2026-06-29T00:00:00.000Z");

export function findCoupon(code?: string) {
  const normalizedCode = code?.trim().toUpperCase();
  return couponRules.find((coupon) => coupon.code === normalizedCode);
}

export function validateCoupon(
  items: CartLineItem[],
  rawCode?: string,
  input: CouponValidationInput = {}
): CouponResult {
  const code = rawCode?.trim().toUpperCase();
  const subtotal = cartSubtotal(items);
  const now = input.now ?? defaultNow;

  if (!code) {
    return { discount: 0, message: "Enter a coupon code.", ok: false };
  }

  const coupon = findCoupon(code);

  if (!coupon) {
    return { code, discount: 0, message: "Coupon not found. Try FIT300, WELCOME10, or FREESHIP.", ok: false };
  }

  const blockedReason = couponBlockReason(coupon, subtotal, now, input);

  if (blockedReason) {
    return { code, discount: 0, message: blockedReason, ok: false };
  }

  const scopedItems = scopeItemsForCoupon(items, coupon);
  const scopedSubtotal = cartSubtotal(scopedItems);

  if (scopedItems.length === 0 && hasScope(coupon)) {
    return { code, discount: 0, message: `${code} is not valid for these products.`, ok: false };
  }

  if (coupon.discountType === "free_shipping") {
    return {
      code,
      discount: 0,
      freeShipping: true,
      message: "Free shipping coupon applied.",
      ok: true
    };
  }

  const rawDiscount =
    coupon.discountType === "fixed_amount"
      ? coupon.value
      : Math.round((scopedSubtotal * coupon.value) / 100);

  const discount = Math.min(rawDiscount, coupon.maximumDiscount ?? rawDiscount, scopedSubtotal);

  return {
    code,
    discount,
    message: `${code} applied successfully.`,
    ok: true
  };
}

export function getActivePromotions() {
  return promotionRules.filter((promotion) => promotion.active);
}

export function getActiveBundles() {
  return bundleDeals.filter((bundle) => bundle.active);
}

export function calculateSubscriptionDiscount(items: CartLineItem[]) {
  return items.reduce((sum, item) => {
    if (item.purchaseType !== "subscribe") return sum;
    return sum + Math.round(item.unitPrice * item.quantity * 0.1);
  }, 0);
}

export function loyaltyBalance(customerId: string) {
  return loyaltyPointEntries
    .filter((entry) => entry.customerId === customerId)
    .reduce((sum, entry) => sum + entry.points, 0);
}

export function estimateEarnedPoints(grandTotal: number) {
  return Math.floor(grandTotal / 100);
}

function couponBlockReason(
  coupon: CouponRule,
  subtotal: number,
  now: Date,
  input: CouponValidationInput
) {
  if (!coupon.active) return `${coupon.code} is inactive.`;
  if (new Date(coupon.startDate) > now) return `${coupon.code} is not active yet.`;
  if (coupon.endDate && new Date(coupon.endDate) < now) return `${coupon.code} has expired.`;
  if (subtotal < coupon.minimumOrderValue) return `Add Rs ${coupon.minimumOrderValue - subtotal} more to use ${coupon.code}.`;
  if (coupon.usageCount >= coupon.usageLimit) return `${coupon.code} usage limit has been reached.`;
  if ((input.usedByCustomer ?? 0) >= coupon.perCustomerLimit) return `${coupon.code} per-customer limit reached.`;
  if (coupon.firstOrderOnly && input.isFirstOrder === false) return `${coupon.code} is for first orders only.`;
  if (coupon.customerGroup !== "all" && input.customerGroup && input.customerGroup !== coupon.customerGroup) {
    return `${coupon.code} is restricted to ${coupon.customerGroup} customers.`;
  }

  return "";
}

function scopeItemsForCoupon(items: CartLineItem[], coupon: CouponRule) {
  if (!hasScope(coupon)) return items;

  return items.filter((item) => {
    const categoryMatch = coupon.categorySlugs?.some((slug) => item.categorySlug === slug);
    const brandMatch = coupon.brandIds?.some((brandId) => item.brandId === brandId || item.brandName?.toLowerCase() === brandId.replace("brand-", ""));
    const productMatch = coupon.productIds?.includes(item.productId);
    return Boolean(categoryMatch || brandMatch || productMatch);
  });
}

function hasScope(coupon: CouponRule) {
  return Boolean(coupon.categorySlugs?.length || coupon.brandIds?.length || coupon.productIds?.length);
}

function cartSubtotal(items: CartLineItem[]) {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
}
