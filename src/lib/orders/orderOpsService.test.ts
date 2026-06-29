import assert from "node:assert/strict";
import test from "node:test";
import type { Address } from "@/types/models";
import type { InventoryBatchRecord } from "@/types/inventory";
import type { AdminOrder } from "@/types/orderOps";
import { cancelOrder, markOrderShipped, reserveOrderStock, updateOrderStatus } from "./orderOpsService";

const address: Address = {
  city: "Mumbai",
  country: "India",
  createdAt: "2026-06-29T00:00:00.000Z",
  customerId: "cust-1",
  firstName: "Aarav",
  id: "addr-1",
  isDefaultBilling: true,
  isDefaultShipping: true,
  label: "home",
  lastName: "Mehta",
  line1: "Test address",
  phone: "9999999999",
  postalCode: "400001",
  state: "Maharashtra",
  updatedAt: "2026-06-29T00:00:00.000Z"
};

function batch(id: string, batchNumber: string, expiryDate: string, availableQuantity: number): InventoryBatchRecord {
  return {
    availableQuantity,
    batchNumber,
    damagedQuantity: 0,
    expiredQuantity: 0,
    expiryDate,
    id,
    manufacturingDate: "2026-01-01",
    mrpPerBatch: 3499,
    productId: "prod-whey-elite",
    productName: "NutraForge Whey Elite",
    purchaseCost: 1800,
    qcStatus: "approved",
    receivedQuantity: availableQuantity,
    reservedQuantity: 0,
    sku: "NF-WHEY-CHOCO-1KG",
    supplierId: "sup-fit",
    supplierName: "Fit Manufacturing Labs",
    variantId: "var-whey-choco-1kg",
    variantLabel: "Double Chocolate / 1 kg",
    warehouseId: "warehouse-mumbai",
    warehouseName: "Mumbai Fulfilment Hub"
  };
}

function order(quantity = 3): AdminOrder {
  return {
    billingAddress: address,
    codConfirmed: true,
    codRisk: "low",
    communicationLog: [],
    currency: "INR",
    customerEmail: "aarav@example.com",
    customerId: "cust-1",
    customerName: "Aarav Mehta",
    customerPhone: "9999999999",
    discountAmount: 0,
    id: "ord-test",
    internalNotes: [],
    items: [
      {
        gstRate: 18,
        hsnCode: "21069099",
        id: "item-1",
        productId: "prod-whey-elite",
        productName: "NutraForge Whey Elite",
        quantity,
        sku: "NF-WHEY-CHOCO-1KG",
        totalAmount: 2999 * quantity,
        unitPrice: 2999,
        variantId: "var-whey-choco-1kg",
        variantLabel: "Double Chocolate / 1 kg"
      }
    ],
    orderNumber: "FS-TEST",
    payment: { amount: 2999 * quantity, method: "prepaid", provider: "razorpay", status: "paid" },
    placedAt: "2026-06-29T00:00:00.000Z",
    return: { refundStatus: "not_started", status: "none" },
    shipment: { carrier: "shiprocket", status: "pending" },
    shippingAddress: address,
    shippingAmount: 0,
    status: "pending",
    subtotal: 2999 * quantity,
    taxAmount: 0,
    timeline: [],
    totalAmount: 2999 * quantity
  };
}

test("status changes append order timeline entries", () => {
  const nextOrder = updateOrderStatus(order(1), "confirmed", "admin-yogesh", "Payment checked.");

  assert.equal(nextOrder.status, "confirmed");
  assert.equal(nextOrder.timeline[0].status, "confirmed");
  assert.match(nextOrder.timeline[0].note ?? "", /Payment checked/);
});

test("FEFO reservation stores split batch allocations and stock movements", () => {
  const result = reserveOrderStock({
    adminId: "admin-yogesh",
    batches: [batch("batch-a", "A-EXP-FIRST", "2027-01-01", 1), batch("batch-b", "B-EXP-LATER", "2027-08-01", 5)],
    minimumShelfLifeDays: 30,
    movements: [],
    order: order(3)
  });

  assert.equal(result.order.status, "confirmed");
  assert.deepEqual(result.order.items[0].batchAllocations?.map((allocation) => allocation.quantity), [1, 2]);
  assert.equal(result.batches.find((item) => item.id === "batch-a")?.availableQuantity, 0);
  assert.equal(result.batches.find((item) => item.id === "batch-b")?.availableQuantity, 3);
  assert.equal(result.movements.filter((movement) => movement.type === "sale_reserved").length, 2);
});

test("shipping and cancellation use exact FEFO allocations", () => {
  const reserved = reserveOrderStock({
    adminId: "admin-yogesh",
    batches: [batch("batch-a", "A-EXP-FIRST", "2027-01-01", 1), batch("batch-b", "B-EXP-LATER", "2027-08-01", 5)],
    minimumShelfLifeDays: 30,
    movements: [],
    order: order(3)
  });
  const shipped = markOrderShipped({ adminId: "admin-yogesh", batches: reserved.batches, movements: reserved.movements, order: reserved.order });

  assert.equal(shipped.order.status, "shipped");
  assert.equal(shipped.batches.find((item) => item.id === "batch-a")?.reservedQuantity, 0);
  assert.equal(shipped.batches.find((item) => item.id === "batch-b")?.reservedQuantity, 0);

  const reservedAgain = reserveOrderStock({
    adminId: "admin-yogesh",
    batches: [batch("batch-a", "A-EXP-FIRST", "2027-01-01", 1), batch("batch-b", "B-EXP-LATER", "2027-08-01", 5)],
    minimumShelfLifeDays: 30,
    movements: [],
    order: order(3)
  });
  const cancelled = cancelOrder({
    adminId: "admin-yogesh",
    batches: reservedAgain.batches,
    movements: reservedAgain.movements,
    order: reservedAgain.order,
    reason: "Customer requested cancellation"
  });

  assert.equal(cancelled.order.status, "cancelled");
  assert.equal(cancelled.batches.find((item) => item.id === "batch-a")?.availableQuantity, 1);
  assert.equal(cancelled.batches.find((item) => item.id === "batch-b")?.availableQuantity, 5);
});
