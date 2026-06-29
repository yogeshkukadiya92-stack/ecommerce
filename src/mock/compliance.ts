import type {
  BatchRecallRecord,
  ProductClaimReview,
  ProductComplianceRecord,
  ProductDelistRecord
} from "@/types/compliance";

export const complianceRecords: ProductComplianceRecord[] = [
  {
    id: "comp-whey-elite",
    productId: "prod-whey-elite",
    productName: "NutraForge Whey Elite",
    fssaiLicense: "FSSAI-100220260001",
    manufacturerName: "Fit Manufacturing Labs Pvt Ltd",
    marketerOrImporterName: "FitSupplement Store",
    labelImageUrl: "/assets/labels/whey-elite-label.png",
    nutritionLabelImageUrl: "/assets/labels/whey-elite-nutrition.png",
    ingredientDeclaration: "Whey protein concentrate, cocoa powder, digestive enzymes, permitted sweetener.",
    allergenDeclaration: "Contains milk and soy. Manufactured in a facility that handles nuts.",
    warningText:
      "This product is not intended to diagnose, treat, cure, or prevent any disease. Consult a qualified professional before use if needed.",
    notForMedicinalUseText: "Not for medicinal use.",
    labReportUrl: "/assets/reports/whey-elite-coa.pdf",
    batchExpiryVisible: true,
    status: "approved",
    reviewedBy: "FitSupplement Admin",
    reviewedAt: "2026-06-25T10:00:00.000Z",
    updatedAt: "2026-06-29T00:00:00.000Z"
  },
  {
    id: "comp-mass-gainer",
    productId: "prod-mass-gainer",
    productName: "PureLift Mass Gainer",
    fssaiLicense: "FSSAI-100220260002",
    manufacturerName: "PureLift Nutrition Works",
    marketerOrImporterName: "PureLift India",
    labelImageUrl: "/assets/labels/mass-gainer-label.png",
    nutritionLabelImageUrl: "",
    ingredientDeclaration: "Maltodextrin, whey protein concentrate, cocoa powder, vitamin blend.",
    allergenDeclaration: "Contains milk and soy.",
    warningText: "Not for medicinal use. Use as directed on label.",
    notForMedicinalUseText: "Not for medicinal use.",
    labReportUrl: "",
    batchExpiryVisible: true,
    status: "needs_update",
    rejectionReason: "Nutrition label image and COA are pending upload.",
    updatedAt: "2026-06-28T00:00:00.000Z"
  },
  {
    id: "comp-daily-multi",
    productId: "prod-daily-multi",
    productName: "VitalStack Daily Multivitamin",
    fssaiLicense: "FSSAI-100220260003",
    manufacturerName: "VitalStack Wellness Labs",
    marketerOrImporterName: "VitalStack",
    labelImageUrl: "/assets/labels/daily-multi-label.png",
    nutritionLabelImageUrl: "/assets/labels/daily-multi-nutrition.png",
    ingredientDeclaration: "Vitamin and mineral blend with plant-based excipients.",
    allergenDeclaration: "No declared allergens in sample data.",
    warningText: "Follow label directions. Consult a qualified professional if pregnant, nursing, or under medication.",
    notForMedicinalUseText: "Not for medicinal use.",
    labReportUrl: "/assets/reports/daily-multi-coa.pdf",
    batchExpiryVisible: true,
    status: "pending",
    updatedAt: "2026-06-27T00:00:00.000Z"
  }
];

export const productClaimReviews: ProductClaimReview[] = [
  {
    id: "claim-whey-1",
    productId: "prod-whey-elite",
    productName: "NutraForge Whey Elite",
    claimText: "Supports daily protein intake and post-workout nutrition routines.",
    status: "approved",
    warningTerms: [],
    reviewerNote: "Structure/function style claim without disease language."
  },
  {
    id: "claim-whey-2",
    productId: "prod-whey-elite",
    productName: "NutraForge Whey Elite",
    claimText: "Helps prevent disease caused by protein deficiency.",
    status: "pending",
    warningTerms: ["prevent disease"],
    reviewerNote: "Needs rewrite before publish."
  },
  {
    id: "claim-multi-1",
    productId: "prod-daily-multi",
    productName: "VitalStack Daily Multivitamin",
    claimText: "Helps maintain everyday wellness as part of a balanced diet.",
    status: "pending",
    warningTerms: []
  }
];

export const delistRecords: ProductDelistRecord[] = [
  {
    id: "delist-sample-1",
    productId: "prod-sample-archived",
    productName: "Archived Sample Supplement",
    reason: "Missing label declaration in sample compliance review.",
    delistedBy: "FitSupplement Admin",
    delistedAt: "2026-06-20T09:00:00.000Z"
  }
];

export const batchRecallRecords: BatchRecallRecord[] = [
  {
    id: "recall-wf-a1",
    batchId: "batch-whey-a1",
    batchNumber: "WF-A1-1127",
    productId: "prod-whey-elite",
    productName: "NutraForge Whey Elite",
    sku: "NF-WHEY-CHOCO-1KG",
    reason: "Mock recall workflow for label mismatch investigation.",
    status: "open",
    blockedFromSale: true,
    affectedOrderIds: ["ord-1001", "ord-1004"],
    customerNotificationStatus: "queued",
    createdAt: "2026-06-29T09:00:00.000Z"
  }
];
