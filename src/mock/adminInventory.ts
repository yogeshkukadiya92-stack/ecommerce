import { batches, inventoryBatches, suppliers, warehouses } from "@/mock/inventory";
import { products } from "@/mock/products";
import type {
  AdvancedInventoryItem,
  AdvancedPurchaseOrder,
  AdvancedStockMovement,
  AdvancedWarehouse,
  ExpiryStatus,
  InventoryBatchRecord,
  QcStatus
} from "@/types/inventory";

const asOfDate = new Date("2026-06-29T00:00:00.000Z");

export const advancedWarehouses: AdvancedWarehouse[] = warehouses.map((warehouse, index) => ({
  address: warehouse.address,
  city: warehouse.city,
  code: warehouse.code,
  id: warehouse.id,
  isActive: warehouse.isActive,
  isDefault: index === 0,
  name: warehouse.name,
  pincode: warehouse.postalCode,
  state: warehouse.state
}));

export const inventoryBatchRecords: InventoryBatchRecord[] = batches.map((batch, index) => {
  const variant = products.flatMap((product) => product.variants).find((item) => item.id === batch.productVariantId);
  const product = products.find((item) => item.id === variant?.productId);
  const inventoryItem =
    inventoryBatches.find((item) => item.batchId === batch.id) ??
    inventoryBatches.find((item) => item.productVariantId === batch.productVariantId);
  const warehouse = advancedWarehouses.find((item) => item.id === inventoryItem?.warehouseId) ?? advancedWarehouses[0];
  const supplier = suppliers.find((item) => item.id === batch.supplierId) ?? suppliers[0];
  const availableQuantity = inventoryItem?.availableStock ?? Math.max(8, (variant?.stock ?? 30) - index * 5);
  const reservedQuantity = inventoryItem?.reservedStock ?? index + 2;
  const damagedQuantity = inventoryItem?.damagedStock ?? 0;
  const expiredQuantity = inventoryItem?.expiredStock ?? 0;
  const qcStatuses: QcStatus[] = ["approved", "approved", "pending", "approved", "rejected"];

  return {
    availableQuantity,
    batchNumber: batch.batchNumber,
    damagedQuantity,
    expiredQuantity,
    expiryDate: batch.expiryDate,
    id: batch.id,
    invoiceDocumentUrl: `/assets/invoices/${batch.batchNumber.toLowerCase()}.pdf`,
    manufacturingDate: batch.manufacturedAt,
    mrpPerBatch: variant?.mrp ?? 0,
    productId: product?.id ?? "unknown-product",
    productName: product?.name ?? "Unknown product",
    purchaseCost: Math.round((variant?.sellingPrice ?? 1000) * 0.62),
    qcStatus: qcStatuses[index] ?? "pending",
    receivedQuantity: availableQuantity + reservedQuantity + damagedQuantity + expiredQuantity,
    reservedQuantity,
    sku: variant?.sku ?? batch.productVariantId,
    supplierId: supplier.id,
    supplierName: supplier.name,
    variantId: batch.productVariantId,
    variantLabel: [variant?.flavor, variant?.size].filter(Boolean).join(" / ") || variant?.sku || "Variant",
    warehouseId: warehouse.id,
    warehouseName: warehouse.name
  };
});

export const advancedInventoryItems: AdvancedInventoryItem[] = inventoryBatchRecords.map((batch) => {
  const totalStock =
    batch.availableQuantity +
    batch.reservedQuantity +
    batch.damagedQuantity +
    batch.expiredQuantity +
    quarantineStockForBatch(batch);

  return {
    availableStock: batch.availableQuantity,
    damagedStock: batch.damagedQuantity,
    expiredStock: batch.expiredQuantity,
    expiryStatus: getExpiryStatus(batch.expiryDate),
    id: `adv-${batch.id}`,
    lowStockThreshold: batch.sku.includes("CRTN") ? 15 : 20,
    productId: batch.productId,
    productName: batch.productName,
    quarantineStock: quarantineStockForBatch(batch),
    reorderPoint: batch.sku.includes("CRTN") ? 25 : 35,
    reservedStock: batch.reservedQuantity,
    sku: batch.sku,
    totalStock,
    variantId: batch.variantId,
    variantLabel: batch.variantLabel,
    warehouseId: batch.warehouseId,
    warehouseName: batch.warehouseName
  };
});

export const advancedStockMovements: AdvancedStockMovement[] = [
  {
    adminId: "admin-yogesh",
    adminNote: "Initial PO receipt from seed data.",
    at: "2026-06-12T10:00:00.000Z",
    batchId: "batch-whey-a1",
    batchNumber: "WF-A1-1127",
    id: "mov-001",
    productName: "NutraForge Whey Elite",
    quantity: 100,
    reason: "purchase received",
    sku: "NF-WHEY-CHOCO-1KG",
    type: "purchase_received",
    warehouseName: "Mumbai Fulfilment Hub"
  },
  {
    adminId: "system",
    at: "2026-06-18T12:30:00.000Z",
    batchId: "batch-whey-a1",
    batchNumber: "WF-A1-1127",
    id: "mov-002",
    productName: "NutraForge Whey Elite",
    quantity: 4,
    reason: "order reservation",
    sku: "NF-WHEY-CHOCO-1KG",
    type: "sale_reserved",
    warehouseName: "Mumbai Fulfilment Hub"
  },
  {
    adminId: "admin-yogesh",
    adminNote: "Damaged tub from inbound carton.",
    at: "2026-06-20T09:15:00.000Z",
    batchId: "batch-whey-a1",
    batchNumber: "WF-A1-1127",
    id: "mov-003",
    productName: "NutraForge Whey Elite",
    quantity: 2,
    reason: "damaged stock",
    sku: "NF-WHEY-CHOCO-1KG",
    type: "damaged",
    warehouseName: "Mumbai Fulfilment Hub"
  }
];

export const advancedPurchaseOrders: AdvancedPurchaseOrder[] = [
  {
    expectedDate: "2026-07-10",
    id: "po-1002",
    items: [
      {
        cost: 720,
        productName: "NutraForge Creatine Monohydrate",
        quantity: 120,
        sku: "NF-CRTN-UNFL-250G",
        variantId: "var-creatine-250g"
      },
      {
        cost: 2150,
        productName: "NutraForge Whey Elite",
        quantity: 80,
        sku: "NF-WHEY-CHOCO-1KG",
        variantId: "var-whey-choco-1kg"
      }
    ],
    status: "ordered",
    supplierId: "sup-fit-manufacturing",
    supplierName: "Fit Manufacturing Labs"
  }
];

export const inventoryReports = [
  { description: "MRP and cost value by warehouse and batch.", name: "Inventory valuation" },
  { description: "Every stock movement with reason and admin actor.", name: "Stock movement report" },
  { description: "Slow movers and aged stock placeholder.", name: "Dead stock report" },
  { description: "Near-expiry and expired quantity risk.", name: "Expiry risk report" },
  { description: "Supplier purchase and landed cost report.", name: "Supplier purchase report" }
] as const;

export function getExpiryStatus(expiryDate: string): ExpiryStatus {
  const days = Math.ceil((new Date(expiryDate).getTime() - asOfDate.getTime()) / 86400000);

  if (days < 0) return "expired";
  if (days <= 30) return "expiring_30";
  if (days <= 60) return "expiring_60";
  if (days <= 90) return "expiring_90";
  return "valid";
}

function quarantineStockForBatch(batch: InventoryBatchRecord) {
  return batch.qcStatus === "pending" || batch.qcStatus === "rejected" ? 4 : 0;
}
