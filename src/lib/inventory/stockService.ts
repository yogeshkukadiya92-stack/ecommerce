import type {
  AdvancedStockMovement,
  InventoryBatchRecord,
  StockAdjustmentInput
} from "@/types/inventory";

export function applyStockAdjustment(input: {
  adjustment: StockAdjustmentInput;
  batches: InventoryBatchRecord[];
  movements: AdvancedStockMovement[];
}) {
  const { adjustment } = input;

  if (!adjustment.reason.trim()) {
    throw new Error("Manual stock adjustment requires a reason.");
  }

  if (!adjustment.adminId.trim()) {
    throw new Error("Manual stock adjustment requires an admin ID.");
  }

  const batch = input.batches.find((item) => item.id === adjustment.batchId);

  if (!batch) {
    throw new Error("Batch not found.");
  }

  const signedQuantity = stockDirection(adjustment.type) * Math.abs(adjustment.quantity);
  const nextAvailableQuantity = batch.availableQuantity + signedQuantity;

  if (nextAvailableQuantity < 0 && !adjustment.allowNegativeStock) {
    throw new Error("Available stock cannot go negative.");
  }

  const nextBatch: InventoryBatchRecord = {
    ...batch,
    availableQuantity: nextAvailableQuantity,
    damagedQuantity:
      adjustment.type === "damaged"
        ? batch.damagedQuantity + Math.abs(adjustment.quantity)
        : batch.damagedQuantity,
    expiredQuantity:
      adjustment.type === "expired"
        ? batch.expiredQuantity + Math.abs(adjustment.quantity)
        : batch.expiredQuantity,
    reservedQuantity:
      adjustment.type === "sale_reserved"
        ? batch.reservedQuantity + Math.abs(adjustment.quantity)
        : batch.reservedQuantity
  };

  const movement: AdvancedStockMovement = {
    adminId: adjustment.adminId,
    adminNote: adjustment.adminNote,
    at: new Date().toISOString(),
    batchId: batch.id,
    batchNumber: batch.batchNumber,
    id: `mov-${Date.now()}`,
    productName: batch.productName,
    quantity: Math.abs(adjustment.quantity),
    reason: adjustment.reason,
    sku: batch.sku,
    type: adjustment.type,
    warehouseName: batch.warehouseName
  };

  return {
    batches: input.batches.map((item) => (item.id === batch.id ? nextBatch : item)),
    movement,
    movements: [movement, ...input.movements]
  };
}

export function receivePurchaseOrderStock(input: {
  adminId: string;
  batches: InventoryBatchRecord[];
  movements: AdvancedStockMovement[];
  quantity: number;
  sourceBatch: InventoryBatchRecord;
}) {
  const receivedBatch: InventoryBatchRecord = {
    ...input.sourceBatch,
    availableQuantity: input.sourceBatch.availableQuantity + input.quantity,
    receivedQuantity: input.sourceBatch.receivedQuantity + input.quantity
  };
  const movement: AdvancedStockMovement = {
    adminId: input.adminId,
    adminNote: "PO receive stock placeholder created/updated batch.",
    at: new Date().toISOString(),
    batchId: input.sourceBatch.id,
    batchNumber: input.sourceBatch.batchNumber,
    id: `mov-${Date.now()}`,
    productName: input.sourceBatch.productName,
    quantity: input.quantity,
    reason: "purchase order received",
    sku: input.sourceBatch.sku,
    type: "purchase_received",
    warehouseName: input.sourceBatch.warehouseName
  };

  return {
    batches: input.batches.map((batch) => (batch.id === input.sourceBatch.id ? receivedBatch : batch)),
    movement,
    movements: [movement, ...input.movements]
  };
}

function stockDirection(type: StockAdjustmentInput["type"]) {
  if (["purchase_received", "return_received", "transfer_in", "adjustment"].includes(type)) {
    return 1;
  }

  return -1;
}
