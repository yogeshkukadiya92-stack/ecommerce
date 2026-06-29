import assert from "node:assert/strict";
import test from "node:test";
import type { InventoryBatchRecord } from "@/types/inventory";
import { reserveStockByFefo } from "./fefo";

function batch(input: Partial<InventoryBatchRecord> & Pick<InventoryBatchRecord, "id" | "batchNumber" | "expiryDate" | "availableQuantity">): InventoryBatchRecord {
  return {
    damagedQuantity: 0,
    expiredQuantity: 0,
    manufacturingDate: "2026-01-01",
    mrpPerBatch: 3499,
    productId: "prod-whey-elite",
    productName: "NutraForge Whey Elite",
    purchaseCost: 1800,
    qcStatus: "approved",
    receivedQuantity: input.availableQuantity,
    reservedQuantity: 0,
    sku: "NF-WHEY-CHOCO-1KG",
    supplierId: "sup-fit",
    supplierName: "Fit Manufacturing Labs",
    variantId: "var-whey-choco-1kg",
    variantLabel: "Double Chocolate / 1 kg",
    warehouseId: "warehouse-mumbai",
    warehouseName: "Mumbai Fulfilment Hub",
    ...input
  };
}

test("reserves nearest valid expiry batch first", () => {
  const result = reserveStockByFefo({
    batches: [
      batch({ availableQuantity: 10, batchNumber: "LATE", expiryDate: "2027-12-01", id: "late" }),
      batch({ availableQuantity: 3, batchNumber: "EARLY", expiryDate: "2027-08-01", id: "early" })
    ],
    quantity: 5,
    rule: { minimumShelfLifeDays: 30 },
    variantId: "var-whey-choco-1kg"
  });

  assert.deepEqual(
    result.allocations.map((allocation) => [allocation.batchNumber, allocation.quantity]),
    [
      ["EARLY", 3],
      ["LATE", 2]
    ]
  );
  assert.equal(result.unfulfilledQuantity, 0);
});

test("rejects expired, rejected QC, and short shelf-life batches", () => {
  const result = reserveStockByFefo({
    batches: [
      batch({ availableQuantity: 10, batchNumber: "EXPIRED", expiryDate: "2026-01-01", id: "expired" }),
      batch({ availableQuantity: 10, batchNumber: "QC-REJECTED", expiryDate: "2027-01-01", id: "rejected", qcStatus: "rejected" }),
      batch({ availableQuantity: 10, batchNumber: "SHORT", expiryDate: "2026-07-05", id: "short" })
    ],
    quantity: 1,
    rule: { minimumShelfLifeDays: 30 },
    variantId: "var-whey-choco-1kg"
  });

  assert.equal(result.allocations.length, 0);
  assert.equal(result.unfulfilledQuantity, 1);
  assert.equal(result.rejectedBatches.length, 3);
});
