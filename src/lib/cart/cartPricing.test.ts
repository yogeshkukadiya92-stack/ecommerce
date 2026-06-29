import assert from "node:assert/strict";
import test from "node:test";
import type { CartLineItem } from "@/types/cart";
import { applyCoupon, calculateCartTotals } from "./cartPricing";

const wheyItem: CartLineItem = {
  addedAt: "2026-06-29T00:00:00.000Z",
  brandName: "NutraForge",
  categorySlug: "protein-powders",
  discountPercent: 14,
  lineId: "line-whey",
  mrp: 3499,
  productId: "prod-whey-elite",
  productName: "NutraForge Whey Elite",
  productSlug: "nutraforge-whey-elite",
  purchaseType: "one-time",
  quantity: 1,
  sku: "NF-WHEY-CHOCO-1KG",
  unitPrice: 2999,
  variantId: "var-whey-choco-1kg",
  variantLabel: "Double Chocolate / 1 kg"
};

test("applies fixed coupon without exceeding cart subtotal", () => {
  const coupon = applyCoupon([wheyItem], "FIT300");

  assert.equal(coupon.ok, true);
  assert.equal(coupon.discount, 300);
  assert.equal(coupon.code, "FIT300");
});

test("rejects coupon when minimum order value is not met", () => {
  const coupon = applyCoupon([{ ...wheyItem, unitPrice: 500, mrp: 500 }], "FIT300");

  assert.equal(coupon.ok, false);
  assert.match(coupon.message, /Add Rs/);
});

test("calculates subscription, coupon, shipping, and loyalty totals", () => {
  const totals = calculateCartTotals(
    [{ ...wheyItem, purchaseType: "subscribe", subscriptionFrequency: "30 days" }],
    "FIT300",
    { loyaltyPointsToRedeem: 100 }
  );

  assert.equal(totals.subtotal, 2999);
  assert.equal(totals.subscriptionDiscount, 300);
  assert.equal(totals.couponDiscount, 300);
  assert.equal(totals.shipping, 0);
  assert.equal(totals.loyaltyRedeemedAmount, 100);
  assert.equal(totals.grandTotal, 2299);
});
