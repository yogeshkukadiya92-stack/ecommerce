import { adminOrders } from "@/mock/adminOrders";
import { inventoryBatchRecords } from "@/mock/adminInventory";
import type { BatchRecallRecord, ProductClaimReview, ProductComplianceRecord } from "@/types/compliance";

const blockedClaimPatterns = [
  "cure",
  "treat",
  "prevent disease",
  "diagnose",
  "heal",
  "medicine",
  "medical treatment"
] as const;

export function scanClaimText(text: string) {
  const normalized = text.toLowerCase();
  return blockedClaimPatterns.filter((pattern) => normalized.includes(pattern));
}

export function complianceCompleteness(record: ProductComplianceRecord) {
  const checks = [
    Boolean(record.fssaiLicense.trim()),
    Boolean(record.manufacturerName.trim()),
    Boolean(record.marketerOrImporterName.trim()),
    Boolean(record.labelImageUrl),
    Boolean(record.nutritionLabelImageUrl),
    Boolean(record.ingredientDeclaration.trim()),
    Boolean(record.allergenDeclaration.trim()),
    Boolean(record.warningText.trim()),
    Boolean(record.notForMedicinalUseText.trim()),
    Boolean(record.labReportUrl),
    record.batchExpiryVisible
  ];
  const passed = checks.filter(Boolean).length;

  return {
    passed,
    total: checks.length,
    percent: Math.round((passed / checks.length) * 100)
  };
}

export function claimHasDiseaseLanguage(claim: ProductClaimReview) {
  return claim.warningTerms.length > 0 || scanClaimText(claim.claimText).length > 0;
}

export function affectedOrdersForRecall(recall: BatchRecallRecord) {
  const orderIds = new Set(recall.affectedOrderIds);
  return adminOrders.filter((order) => orderIds.has(order.id) || order.items.some((item) => item.batchId === recall.batchId));
}

export function batchIsBlockedFromSale(batchId: string, recalls: BatchRecallRecord[]) {
  return recalls.some((recall) => recall.batchId === batchId && recall.blockedFromSale && recall.status !== "closed");
}

export function searchBatchesByNumber(query: string) {
  const normalized = query.trim().toLowerCase();

  if (!normalized) {
    return inventoryBatchRecords;
  }

  return inventoryBatchRecords.filter((batch) => batch.batchNumber.toLowerCase().includes(normalized));
}
