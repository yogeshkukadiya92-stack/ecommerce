import type { ID } from "./models";

export type ComplianceStatus = "pending" | "approved" | "rejected" | "needs_update";
export type ClaimStatus = "pending" | "approved" | "rejected";
export type RecallStatus = "open" | "notified" | "closed";

export interface ProductComplianceRecord {
  id: ID;
  productId: ID;
  productName: string;
  fssaiLicense: string;
  manufacturerName: string;
  marketerOrImporterName: string;
  labelImageUrl?: string;
  nutritionLabelImageUrl?: string;
  ingredientDeclaration: string;
  allergenDeclaration: string;
  warningText: string;
  notForMedicinalUseText: string;
  labReportUrl?: string;
  batchExpiryVisible: boolean;
  status: ComplianceStatus;
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  updatedAt: string;
}

export interface ProductClaimReview {
  id: ID;
  productId: ID;
  productName: string;
  claimText: string;
  status: ClaimStatus;
  warningTerms: string[];
  reviewerNote?: string;
}

export interface ProductDelistRecord {
  id: ID;
  productId: ID;
  productName: string;
  reason: string;
  delistedBy: string;
  delistedAt: string;
}

export interface BatchRecallRecord {
  id: ID;
  batchId: ID;
  batchNumber: string;
  productId: ID;
  productName: string;
  sku: string;
  reason: string;
  status: RecallStatus;
  blockedFromSale: boolean;
  affectedOrderIds: ID[];
  customerNotificationStatus: "not_started" | "queued" | "sent";
  createdAt: string;
}
