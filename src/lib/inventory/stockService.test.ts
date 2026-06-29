import assert from "node:assert/strict";
import test from "node:test";
import type { InventoryBatchRecord } from "@/types/inventory";
import { applyStockAdjustment, receivePurchaseOrderStock } from "./stockService";

const baseBatch: InventoryBatchRecord = {
  availableQuantity: 10,
  batchNumber: "WF-A1-1127",
  damagedQuantity: 0,
  expiredQuantity: 0,
  expiryDate: "2027-11-30",
  id: "batch-whey-a1",
  manufacturingDate: "2026-01-01",
  mrpPerBatch: 3499,
  productId: "prod-whey-elite",
  productName: "NutraForge Whey Elite",
  purchaseCost: 1800,
  qcStatus: "approved",
  receivedQuantity: 10,
  reservedQuantity: 0,
  sku: "NF-WHEY-CHOCO-1KG",
  supplierId: "sup-fit",
  supplierName: "Fit Manufacturing Labs",
  variantId: "var-whey-choco-1kg",
  variantLabel: "Double Chocolate / 1 kg",
  warehouseId: "warehouse-mumbai",
  warehouseName: "Mumbai Fulfilment Hub"
};

test("requires reason and admin ID for manual stock adjustment", () => {
  assert.throws(
    () =>
      applyStockAdjustment({
        adjustment: { adminId: "admin-yogesh", batchId: baseBatch.id, quantity: 1, reason: "", type: "damaged" },
        batches: [baseBatch],
        movements: []
      }),
    /requires a reason/
  );

  assert.throws(
    () =>
      applyStockAdjustment({
        adjustment: { adminId: "", batchId: baseBatch.id, quantity: 1, reason: "Cycle count", type: "adjustment" },
        batches: [baseBatch],
        movements: []
      }),
    /requires an admin ID/
  );
});

test("prevents negative available stock and records movement", () => {
  assert.throws(
    () =>
      applyStockAdjustment({
        adjustment: { adminId: "admin-yogesh", batchId: baseBatch.id, quantity: 20, reason: "Damage found", type: "damaged" },
        batches: [baseBatch],
        movements: []
      }),
    /cannot go negative/
  );

  const result = applyStockAdjustment({
    adjustment: { adminId: "admin-yogesh", batchId: baseBatch.id, quantity: 2, reason: "Damage found", type: "damaged" },
    batches: [baseBatch],
    movements: []
  });

  assert.equal(result.batches[0].availableQuantity, 8);
  assert.equal(result.batches[0].damagedQuantity, 2);
  assert.equal(result.movements[0].type, "damaged");
});

test("receives purchase order stock and creates a purchase movement", () => {
  const result = receivePurchaseOrderStock({
    adminId: "admin-yogesh",
    batches: [baseBatch],
    movements: [],
    quantity: 5,
    sourceBatch: baseBatch
  });

  assert.equal(result.batches[0].availableQuantity, 15);
  assert.equal(result.batches[0].receivedQuantity, 15);
  assert.equal(result.movements[0].type, "purchase_received");
});
