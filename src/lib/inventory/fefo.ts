import type { FefoReservationInput, FefoReservationResult, InventoryBatchRecord } from "@/types/inventory";

const defaultAsOfDate = new Date("2026-06-29T00:00:00.000Z");

export function getShelfLifeDays(expiryDate: string, asOfDate = defaultAsOfDate) {
  return Math.ceil((new Date(expiryDate).getTime() - asOfDate.getTime()) / 86400000);
}

export function isBatchSellable(
  batch: InventoryBatchRecord,
  minimumShelfLifeDays: number,
  asOfDate = defaultAsOfDate
) {
  return batch.qcStatus === "approved" && getShelfLifeDays(batch.expiryDate, asOfDate) >= minimumShelfLifeDays;
}

export function reserveStockByFefo(input: FefoReservationInput): FefoReservationResult {
  let remainingQuantity = input.quantity;
  const allocations: FefoReservationResult["allocations"] = [];
  const rejectedBatches: FefoReservationResult["rejectedBatches"] = [];
  const eligibleBatches = input.batches
    .filter((batch) => batch.variantId === input.variantId)
    .filter((batch) => (input.warehouseId ? batch.warehouseId === input.warehouseId : true))
    .sort((first, second) => new Date(first.expiryDate).getTime() - new Date(second.expiryDate).getTime());

  for (const batch of eligibleBatches) {
    if (remainingQuantity <= 0) {
      break;
    }

    const shelfLifeDays = getShelfLifeDays(batch.expiryDate);

    if (shelfLifeDays < 0 && !input.rule.allowExpired) {
      rejectedBatches.push({
        batchNumber: batch.batchNumber,
        reason: "Expired batch cannot be sold."
      });
      continue;
    }

    if (!isBatchSellable(batch, input.rule.minimumShelfLifeDays)) {
      rejectedBatches.push({
        batchNumber: batch.batchNumber,
        reason:
          batch.qcStatus !== "approved"
            ? `QC status is ${batch.qcStatus}.`
            : `Shelf life is below ${input.rule.minimumShelfLifeDays} days.`
      });
      continue;
    }

    if (batch.availableQuantity <= 0) {
      rejectedBatches.push({
        batchNumber: batch.batchNumber,
        reason: "No available stock."
      });
      continue;
    }

    const quantity = Math.min(batch.availableQuantity, remainingQuantity);
    allocations.push({
      batchId: batch.id,
      batchNumber: batch.batchNumber,
      expiryDate: batch.expiryDate,
      quantity
    });
    remainingQuantity -= quantity;
  }

  return {
    allocations,
    rejectedBatches,
    unfulfilledQuantity: remainingQuantity
  };
}
