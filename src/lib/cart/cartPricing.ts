import type { CartLineItem, CartTotals, CouponResult } from "@/types/cart";
import { estimateEarnedPoints, calculateSubscriptionDiscount, validateCoupon } from "@/lib/promotions/promotionService";

const FREE_SHIPPING_THRESHOLD = 1999;

export function calculateCartTotals(
  items: CartLineItem[],
  couponCode?: string,
  options: { loyaltyPointsToRedeem?: number } = {}
): CartTotals {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => sum + (item.mrp ?? item.unitPrice) * item.quantity, 0);
  const productDiscount = Math.max(0, mrpTotal - subtotal);
  const couponResult = applyCoupon(items, couponCode);
  const subscriptionDiscount = calculateSubscriptionDiscount(items);
  const shippingBeforeCoupon = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : 99;
  const shipping = couponResult.freeShipping ? 0 : shippingBeforeCoupon;
  const tax = 0;
  const loyaltyRedeemedAmount = Math.min(options.loyaltyPointsToRedeem ?? 0, Math.max(0, subtotal - couponResult.discount - subscriptionDiscount));
  const grandTotal = Math.max(0, subtotal - couponResult.discount - subscriptionDiscount - loyaltyRedeemedAmount + shipping + tax);

  return {
    couponCode: couponResult.ok ? couponResult.code : undefined,
    couponDiscount: couponResult.discount,
    freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
    grandTotal,
    itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
    loyaltyEarnedPoints: estimateEarnedPoints(grandTotal),
    loyaltyRedeemedAmount,
    mrpTotal,
    productDiscount,
    shipping,
    subtotal,
    subscriptionDiscount,
    tax
  };
}

export function applyCoupon(items: CartLineItem[], rawCode?: string): CouponResult {
  return validateCoupon(items, rawCode, { customerGroup: "all", isFirstOrder: true, usedByCustomer: 0 });
}

export function formatRs(amount: number) {
  return `Rs ${amount.toLocaleString("en-IN")}`;
}
