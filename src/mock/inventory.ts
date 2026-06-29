import type { Batch, InventoryItem, Supplier, Warehouse } from "@/types";

const now = "2026-06-29T00:00:00.000Z";

export const warehouses: Warehouse[] = [
  {
    id: "wh-mumbai",
    code: "MUM-01",
    name: "Mumbai Fulfilment Hub",
    address: "Andheri East Industrial Estate",
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400069",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "wh-delhi",
    code: "DEL-01",
    name: "Delhi NCR Warehouse",
    address: "Sector 62 Logistics Park",
    city: "Noida",
    state: "Uttar Pradesh",
    postalCode: "201309",
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

export const suppliers: Supplier[] = [
  {
    id: "sup-fit-manufacturing",
    name: "Fit Manufacturing Labs",
    email: "ops@fitlabs.example",
    phone: "+91 90000 00001",
    gstNumber: "27AAACF0000A1Z5",
    address: "Bhiwandi, Maharashtra",
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

export const batches: Batch[] = [
  {
    id: "batch-whey-a1",
    batchNumber: "WF-A1-1127",
    productVariantId: "var-whey-choco-1kg",
    supplierId: "sup-fit-manufacturing",
    manufacturedAt: "2026-01-15",
    expiryDate: "2027-11-30",
    receivedAt: "2026-02-01",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "batch-whey-b2",
    batchNumber: "WF-B2-1027",
    productVariantId: "var-whey-vanilla-2kg",
    supplierId: "sup-fit-manufacturing",
    manufacturedAt: "2026-01-05",
    expiryDate: "2027-10-31",
    receivedAt: "2026-02-10",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "batch-gainer-c1",
    batchNumber: "PL-C1-0827",
    productVariantId: "var-gainer-kulfi-3kg",
    supplierId: "sup-fit-manufacturing",
    manufacturedAt: "2026-02-12",
    expiryDate: "2027-08-31",
    receivedAt: "2026-03-02",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "batch-creatine-d1",
    batchNumber: "NF-D1-0128",
    productVariantId: "var-creatine-250g",
    supplierId: "sup-fit-manufacturing",
    manufacturedAt: "2026-03-18",
    expiryDate: "2028-01-31",
    receivedAt: "2026-04-04",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "batch-multi-e1",
    batchNumber: "VS-E1-1227",
    productVariantId: "var-multi-60-tabs",
    supplierId: "sup-fit-manufacturing",
    manufacturedAt: "2026-02-22",
    expiryDate: "2027-12-31",
    receivedAt: "2026-03-10",
    createdAt: now,
    updatedAt: now
  }
];

export const inventoryBatches: InventoryItem[] = [
  {
    id: "inv-whey-choco-mum",
    productVariantId: "var-whey-choco-1kg",
    warehouseId: "wh-mumbai",
    batchId: "batch-whey-a1",
    batchNumber: "WF-A1-1127",
    expiryDate: "2027-11-30",
    availableStock: 88,
    reservedStock: 12,
    damagedStock: 2,
    expiredStock: 0,
    lowStockThreshold: 20,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "inv-creatine-del",
    productVariantId: "var-creatine-250g",
    warehouseId: "wh-delhi",
    batchId: "batch-creatine-d1",
    batchNumber: "NF-D1-0128",
    expiryDate: "2028-01-31",
    availableStock: 9,
    reservedStock: 3,
    damagedStock: 0,
    expiredStock: 0,
    lowStockThreshold: 15,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "inv-gainer-mum",
    productVariantId: "var-gainer-kulfi-3kg",
    warehouseId: "wh-mumbai",
    batchId: "batch-gainer-c1",
    batchNumber: "PL-C1-0827",
    expiryDate: "2027-08-31",
    availableStock: 36,
    reservedStock: 4,
    damagedStock: 1,
    expiredStock: 0,
    lowStockThreshold: 12,
    createdAt: now,
    updatedAt: now
  }
];
