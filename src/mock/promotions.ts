import type {
  BundleDeal,
  CouponRule,
  CustomerSubscription,
  LoyaltyPointEntry,
  PromotionRule,
  ReferralRecord
} from "@/types/promotions";

export const couponRules: CouponRule[] = [
  {
    abusePreventionNote: "Block repeated device/session coupon attempts and flag abnormal redemption velocity.",
    active: true,
    code: "FIT300",
    customerGroup: "all",
    description: "Rs 300 off supplement stacks above Rs 2,999.",
    discountType: "fixed_amount",
    id: "coupon-fit300",
    firstOrderOnly: false,
    minimumOrderValue: 2999,
    perCustomerLimit: 2,
    productIds: ["prod-whey-elite", "prod-creatine-mono"],
    startDate: "2026-06-01",
    usageCount: 128,
    usageLimit: 1000,
    value: 300
  },
  {
    abusePreventionNote: "First order check should combine account, phone, device fingerprint, and payment identifier later.",
    active: true,
    code: "WELCOME10",
    customerGroup: "first_time",
    description: "10% first order discount capped at Rs 500.",
    discountType: "percentage",
    firstOrderOnly: true,
    id: "coupon-welcome10",
    maximumDiscount: 500,
    minimumOrderValue: 1999,
    perCustomerLimit: 1,
    startDate: "2026-06-01",
    usageCount: 82,
    usageLimit: 500,
    value: 10
  },
  {
    abusePreventionNote: "Free shipping should not stack with courier surcharge or remote-area rules later.",
    active: true,
    categorySlugs: ["protein-powders", "performance"],
    code: "FREESHIP",
    customerGroup: "all",
    description: "Free shipping for performance and protein orders above Rs 999.",
    discountType: "free_shipping",
    firstOrderOnly: false,
    id: "coupon-freeship",
    minimumOrderValue: 999,
    perCustomerLimit: 4,
    startDate: "2026-06-01",
    usageCount: 41,
    usageLimit: 800,
    value: 0
  }
];

export const promotionRules: PromotionRule[] = [
  {
    active: true,
    brandIds: ["brand-nutraforge"],
    description: "Brand-wide NutraForge push for protein and creatine.",
    discountType: "percentage",
    id: "promo-nutraforge-12",
    name: "NutraForge 12% brand discount",
    performance: { conversionRate: 7.8, orders: 184, revenue: 524000 },
    startDate: "2026-06-20",
    type: "brand_discount",
    value: 12
  },
  {
    active: true,
    description: "Flash sale deal timer for best sellers.",
    discountType: "percentage",
    endDate: "2026-07-03T23:59:00.000Z",
    id: "promo-flash-stack",
    name: "72 hour stack sale",
    performance: { conversionRate: 11.4, orders: 96, revenue: 312500 },
    productIds: ["prod-whey-elite", "prod-creatine-mono"],
    startDate: "2026-06-29T00:00:00.000Z",
    type: "flash_sale",
    value: 8
  },
  {
    active: true,
    description: "Gift with purchase placeholder for shaker above Rs 3,999.",
    discountType: "fixed_amount",
    id: "promo-gwp-shaker",
    name: "Free shaker gift placeholder",
    performance: { conversionRate: 4.2, orders: 38, revenue: 152000 },
    startDate: "2026-06-15",
    type: "gift_with_purchase",
    value: 499
  }
];

export const bundleDeals: BundleDeal[] = [
  {
    active: true,
    bundlePrice: 3899,
    description: "Whey, creatine, and multivitamin starter stack.",
    discountAmount: 449,
    id: "bundle-strength-stack",
    imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80",
    productIds: ["prod-whey-elite", "prod-creatine-mono", "prod-daily-multi"],
    slug: "strength-starter-stack",
    title: "Strength Starter Stack"
  },
  {
    active: true,
    bundlePrice: 3299,
    description: "Mass gainer plus shaker bundle for calorie-focused routines.",
    discountAmount: 299,
    id: "bundle-gainer-shaker",
    imageUrl: "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=900&q=80",
    productIds: ["prod-mass-gainer"],
    slug: "gainer-shaker-combo",
    title: "Gainer + Shaker Combo"
  }
];

export const subscriptions: CustomerSubscription[] = [
  {
    addressId: "addr-aarav-home",
    customerId: "cust-aarav",
    discountPercent: 10,
    frequency: "30 days",
    id: "sub-whey-aarav",
    nextDeliveryDate: "2026-07-29",
    productId: "prod-whey-elite",
    status: "active",
    variantId: "var-whey-choco-1kg"
  }
];

export const loyaltyPointEntries: LoyaltyPointEntry[] = [
  { at: "2026-06-14", customerId: "cust-aarav", id: "lp-001", note: "Purchase reward", points: 190, type: "purchase" },
  { at: "2026-06-18", customerId: "cust-aarav", id: "lp-002", note: "Verified review reward", points: 75, type: "review" },
  { at: "2026-06-22", customerId: "cust-aarav", id: "lp-003", note: "Referral signup reward", points: 150, type: "referral" },
  { at: "2026-06-25", customerId: "cust-aarav", id: "lp-004", note: "Checkout redemption", points: -100, type: "redeem" },
  { at: "2026-06-28", customerId: "cust-aarav", id: "lp-005", note: "Admin adjustment placeholder", points: 105, type: "admin_adjustment" }
];

export const referralRecords: ReferralRecord[] = [
  {
    code: "FIT-AARAV",
    friendReward: "WELCOME10 unlocked for friend",
    id: "ref-aarav-001",
    landingLink: "https://fitsupplement.example/ref/FIT-AARAV",
    referredEmail: "friend@example.com",
    referrerCustomerId: "cust-aarav",
    referrerReward: "150 loyalty points after first order",
    status: "ordered"
  }
];
