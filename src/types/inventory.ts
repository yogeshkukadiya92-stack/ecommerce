export type AdvancedWarehouse = {
  address: string;
  city: string;
  code: string;
  id: string;
  isActive: boolean;
  isDefault: boolean;
  name: string;
  pincode: string;
  state: string;
};

export type ExpiryStatus = "valid" | "expiring_90" | "expiring_60" | "expiring_30" | "expired";

export type QcStatus = "pending" | "approved" | "rejected";

export type AdvancedInventoryItem = {
  availableStock: number;
  damagedStock: number;
  expiredStock: number;
  expiryStatus: ExpiryStatus;
  id: string;
  lowStockThreshold: number;
  productId: string;
  productName: string;
  quarantineStock: number;
  reorderPoint: number;
  reservedStock: number;
  sku: string;
  totalStock: number;
  variantId: string;
  variantLabel: string;
  warehouseId: string;
  warehouseName: string;
};

export type InventoryBatchRecord = {
  availableQuantity: number;
  batchNumber: string;
  damagedQuantity: number;
  expiredQuantity: number;
  expiryDate: string;
  id: string;
  invoiceDocumentUrl?: string;
  manufacturingDate?: string;
  mrpPerBatch: number;
  productId: string;
  productName: string;
  purchaseCost: number;
  qcStatus: QcStatus;
  receivedQuantity: number;
  reservedQuantity: number;
  sku: string;
  supplierId: string;
  supplierName: string;
  variantId: string;
  variantLabel: string;
  warehouseId: string;
  warehouseName: string;
};

export type AdvancedStockMovementType =
  | "purchase_received"
  | "sale_reserved"
  | "sale_shipped"
  | "return_received"
  | "damaged"
  | "expired"
  | "adjustment"
  | "transfer_in"
  | "transfer_out"
  | "vendor_return"
  | "manual_correction";

export type AdvancedStockMovement = {
  adminId: string;
  adminNote?: string;
  at: string;
  batchId: string;
  batchNumber: string;
  id: string;
  productName: string;
  quantity: number;
  reason: string;
  sku: string;
  type: AdvancedStockMovementType;
  warehouseName: string;
};

export type AdvancedPurchaseOrderStatus =
  | "draft"
  | "ordered"
  | "partially_received"
  | "received"
  | "cancelled";

export type AdvancedPurchaseOrder = {
  expectedDate: string;
  id: string;
  items: Array<{
    cost: number;
    productName: string;
    quantity: number;
    sku: string;
    variantId: string;
  }>;
  status: AdvancedPurchaseOrderStatus;
  supplierId: string;
  supplierName: string;
};

export type StockAdjustmentInput = {
  adminId: string;
  adminNote?: string;
  allowNegativeStock?: boolean;
  batchId: string;
  quantity: number;
  reason: string;
  type: AdvancedStockMovementType;
};

export type FefoReservationRule = {
  allowExpired?: boolean;
  minimumShelfLifeDays: number;
};

export type FefoReservationInput = {
  batches: InventoryBatchRecord[];
  quantity: number;
  rule: FefoReservationRule;
  variantId: string;
  warehouseId?: string;
};

export type FefoAllocation = {
  batchId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number;
};

export type FefoReservationResult = {
  allocations: FefoAllocation[];
  rejectedBatches: Array<{
    batchNumber: string;
    reason: string;
  }>;
  unfulfilledQuantity: number;
};
