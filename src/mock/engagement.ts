import type {
  AbandonedCartLead,
  CrmCustomerProfile,
  MarketingAutomationRule,
  ProductAlertSignup,
  ProductQuestionThread,
  ProductReview
} from "@/types/engagement";

const now = "2026-06-29T00:00:00.000Z";

export const productReviews: ProductReview[] = [
  {
    id: "review-aarav-whey",
    productId: "prod-whey-elite",
    productName: "NutraForge Whey Elite",
    customerId: "cust-aarav",
    customerName: "Aarav Mehta",
    orderId: "order-1001",
    rating: 5,
    tasteRating: 5,
    mixabilityRating: 5,
    valueRating: 4,
    title: "Clean taste and easy mix",
    comment: "The chocolate flavor mixes quickly and the label details are easy to verify before reordering.",
    tags: ["Taste", "Mixability", "Verified batch"],
    mediaPlaceholder: "Photo/video upload placeholder",
    isVerifiedPurchase: true,
    status: "approved",
    adminReply: "Thanks Aarav. We are glad the label and batch details helped.",
    createdAt: "2026-06-20T10:30:00.000Z",
    updatedAt: now
  },
  {
    id: "review-nisha-whey",
    productId: "prod-whey-elite",
    productName: "NutraForge Whey Elite",
    customerId: "cust-nisha",
    customerName: "Nisha Rao",
    orderId: "order-1002",
    rating: 4,
    tasteRating: 4,
    mixabilityRating: 5,
    valueRating: 4,
    title: "Good daily protein option",
    comment: "Solid protein option. Allergen and warning text is clear, which makes buying easier.",
    tags: ["Label clarity", "Value"],
    mediaPlaceholder: "Video upload placeholder",
    isVerifiedPurchase: true,
    status: "approved",
    createdAt: "2026-06-22T11:00:00.000Z",
    updatedAt: now
  },
  {
    id: "review-rohan-creatine",
    productId: "prod-creatine-mono",
    productName: "NutraForge Creatine Monohydrate",
    customerId: "cust-aarav",
    customerName: "Aarav Mehta",
    orderId: "order-1003",
    rating: 5,
    tasteRating: 5,
    mixabilityRating: 4,
    valueRating: 5,
    title: "Straightforward unflavoured creatine",
    comment: "Simple unflavoured creatine with strong value per serving.",
    tags: ["Value", "Mixability"],
    mediaPlaceholder: "Photo upload placeholder",
    isVerifiedPurchase: true,
    status: "pending",
    createdAt: "2026-06-27T09:00:00.000Z",
    updatedAt: now
  },
  {
    id: "review-reported-gainer",
    productId: "prod-mass-gainer",
    productName: "PureLift Mass Gainer",
    customerId: "cust-nisha",
    customerName: "Nisha Rao",
    rating: 2,
    tasteRating: 2,
    mixabilityRating: 3,
    valueRating: 2,
    title: "Needs moderation review",
    comment: "Reported sample review for admin moderation workflow testing.",
    tags: ["Reported"],
    mediaPlaceholder: "Media moderation placeholder",
    isVerifiedPurchase: false,
    status: "reported",
    reportedReason: "Language review requested",
    createdAt: "2026-06-28T12:20:00.000Z",
    updatedAt: now
  }
];

export const productQuestions: ProductQuestionThread[] = [
  {
    id: "qa-whey-sweetness",
    productId: "prod-whey-elite",
    productName: "NutraForge Whey Elite",
    customerId: "cust-aarav",
    customerName: "Aarav Mehta",
    question: "Is the chocolate flavor very sweet?",
    answer: "It is designed to be moderate. Taste can vary by mixing liquid and serving size.",
    answeredBy: "FitSupplement Admin",
    isAdminAnswered: true,
    status: "answered",
    createdAt: "2026-06-19T08:00:00.000Z",
    answeredAt: "2026-06-19T11:00:00.000Z"
  },
  {
    id: "qa-whey-beginner",
    productId: "prod-whey-elite",
    productName: "NutraForge Whey Elite",
    customerId: "cust-nisha",
    customerName: "Nisha Rao",
    question: "Can beginners use this?",
    answer: "Beginners can use protein supplements to support dietary protein intake, but should follow label directions.",
    answeredBy: "FitSupplement Admin",
    isAdminAnswered: true,
    status: "answered",
    createdAt: "2026-06-21T08:00:00.000Z",
    answeredAt: "2026-06-21T10:00:00.000Z"
  },
  {
    id: "qa-creatine-mix",
    productId: "prod-creatine-mono",
    productName: "NutraForge Creatine Monohydrate",
    customerName: "Guest shopper",
    question: "Can it be mixed with juice?",
    isAdminAnswered: false,
    status: "pending",
    createdAt: "2026-06-28T14:00:00.000Z"
  }
];

export const crmCustomerProfiles: CrmCustomerProfile[] = [
  {
    customerId: "cust-aarav",
    lifetimeValue: 12840,
    averageOrderValue: 3210,
    repeatPurchaseCount: 4,
    lastOrderDate: "2026-06-24",
    wishlistProductIds: ["prod-whey-elite", "prod-creatine-mono"],
    reviewIds: ["review-aarav-whey", "review-rohan-creatine"],
    supportNotes: [
      {
        id: "note-aarav-1",
        note: "Prefers chocolate whey and prepaid delivery. Good candidate for subscription renewal reminder.",
        author: "Admin",
        createdAt: "2026-06-25T10:00:00.000Z"
      }
    ],
    segments: ["repeat", "VIP"],
    returnRatePercent: 0,
    codRiskScore: "low"
  },
  {
    customerId: "cust-nisha",
    lifetimeValue: 3860,
    averageOrderValue: 1930,
    repeatPurchaseCount: 2,
    lastOrderDate: "2026-06-18",
    wishlistProductIds: ["prod-daily-multi"],
    reviewIds: ["review-nisha-whey", "review-reported-gainer"],
    supportNotes: [
      {
        id: "note-nisha-1",
        note: "Asked about allergen clarity. Keep supplement disclaimers visible in replies.",
        author: "Support",
        createdAt: "2026-06-23T12:00:00.000Z"
      }
    ],
    segments: ["repeat"],
    returnRatePercent: 8,
    codRiskScore: "medium"
  }
];

export const marketingAutomationRules: MarketingAutomationRule[] = [
  {
    id: "auto-abandoned-cart",
    name: "Abandoned cart recovery",
    trigger: "abandoned_cart",
    channels: ["email", "WhatsApp"],
    status: "active",
    audienceSegment: "all",
    delayHours: 2,
    sentCount: 420,
    openRatePercent: 41,
    clickRatePercent: 12,
    revenueAttributed: 87400,
    lastRunAt: "2026-06-29T08:00:00.000Z"
  },
  {
    id: "auto-review-request",
    name: "Review request after delivery",
    trigger: "review_request",
    channels: ["email", "SMS"],
    status: "active",
    audienceSegment: "repeat",
    delayHours: 72,
    sentCount: 188,
    openRatePercent: 36,
    clickRatePercent: 10,
    revenueAttributed: 0
  },
  {
    id: "auto-reorder-reminder",
    name: "Protein reorder reminder",
    trigger: "reorder_reminder",
    channels: ["email", "WhatsApp"],
    status: "draft",
    audienceSegment: "VIP",
    delayHours: 720,
    sentCount: 0
  },
  {
    id: "auto-back-in-stock",
    name: "Back in stock alert",
    trigger: "back_in_stock_alert",
    channels: ["email", "SMS", "WhatsApp"],
    status: "paused",
    audienceSegment: "all",
    delayHours: 0,
    sentCount: 64,
    openRatePercent: 48,
    clickRatePercent: 18,
    revenueAttributed: 12600
  },
  {
    id: "auto-price-drop",
    name: "Price drop alert",
    trigger: "price_drop_alert",
    channels: ["email"],
    status: "active",
    audienceSegment: "all",
    delayHours: 0,
    sentCount: 91,
    openRatePercent: 39,
    clickRatePercent: 14,
    revenueAttributed: 21800
  },
  {
    id: "auto-birthday-coupon",
    name: "Birthday coupon",
    trigger: "birthday_coupon",
    channels: ["email", "WhatsApp"],
    status: "draft",
    audienceSegment: "VIP",
    delayHours: 0,
    sentCount: 0
  },
  {
    id: "auto-winback",
    name: "Win-back campaign",
    trigger: "win_back_campaign",
    channels: ["email", "SMS"],
    status: "draft",
    audienceSegment: "inactive",
    delayHours: 0,
    sentCount: 0
  }
];

export const abandonedCartLeads: AbandonedCartLead[] = [
  {
    id: "cart-aarav-1",
    customerId: "cust-aarav",
    customerName: "Aarav Mehta",
    email: "aarav.mehta@example.com",
    phone: "+91 98765 43210",
    cartValue: 4298,
    itemCount: 2,
    lastActivityAt: "2026-06-29T06:40:00.000Z",
    channelsQueued: ["email", "WhatsApp"]
  },
  {
    id: "cart-guest-1",
    customerName: "Guest shopper",
    email: "guest@example.com",
    cartValue: 1299,
    itemCount: 1,
    lastActivityAt: "2026-06-29T07:15:00.000Z",
    channelsQueued: ["email"]
  }
];

export const productAlertSignups: ProductAlertSignup[] = [
  {
    id: "alert-stock-whey",
    productId: "prod-whey-elite",
    productName: "NutraForge Whey Elite",
    customerEmail: "aarav.mehta@example.com",
    type: "back_in_stock",
    channel: "WhatsApp",
    status: "active",
    createdAt: "2026-06-28T10:00:00.000Z"
  },
  {
    id: "alert-price-creatine",
    productId: "prod-creatine-mono",
    productName: "NutraForge Creatine Monohydrate",
    customerEmail: "nisha.rao@example.com",
    type: "price_drop",
    targetPrice: 999,
    channel: "email",
    status: "active",
    createdAt: "2026-06-27T09:30:00.000Z"
  }
];
