"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import { AlertTriangle, ClipboardList, PackageCheck, Plus, RotateCw, Save } from "lucide-react";
import {
  advancedPurchaseOrders,
  advancedStockMovements,
  advancedWarehouses,
  inventoryBatchRecords,
  inventoryReports
} from "@/mock/adminInventory";
import type {
  AdvancedPurchaseOrder,
  AdvancedStockMovement,
  AdvancedStockMovementType,
  AdvancedWarehouse,
  InventoryBatchRecord
} from "@/types/inventory";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { showDemoData } from "@/lib/admin/liveData";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import { reserveStockByFefo } from "@/lib/inventory/fefo";
import { applyStockAdjustment, receivePurchaseOrderStock } from "@/lib/inventory/stockService";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";
import { LiveAdminEmptyState } from "./LiveAdminEmptyState";

const tabs = [
  "Overview",
  "Warehouses",
  "Batches",
  "Movements",
  "Purchase Orders",
  "Adjustments",
  "Expiry Alerts",
  "Low Stock",
  "FEFO",
  "Reports"
] as const;

type InventoryTab = (typeof tabs)[number];

const movementTypes: AdvancedStockMovementType[] = [
  "purchase_received",
  "sale_reserved",
  "sale_shipped",
  "return_received",
  "damaged",
  "expired",
  "adjustment",
  "transfer_in",
  "transfer_out",
  "vendor_return",
  "manual_correction"
];

export function InventoryManagementClient() {
  if (!showDemoData) {
    return (
      <LiveAdminEmptyState
        actionHref="/admin/settings"
        actionLabel="Configure inventory"
        title="Inventory is clean and ready for live stock"
        description="Demo warehouses, batches, stock movements, purchase orders, FEFO reservations, and expiry alerts are hidden. Connect real inventory records before launch operations."
      />
    );
  }

  return <DemoInventoryManagementClient />;
}

function DemoInventoryManagementClient() {
  const { session } = useAdminSession();
  const [activeTab, setActiveTab] = useState<InventoryTab>("Overview");
  const [warehouses, setWarehouses] = useState<AdvancedWarehouse[]>(advancedWarehouses);
  const [batches, setBatches] = useState<InventoryBatchRecord[]>(inventoryBatchRecords);
  const [movements, setMovements] = useState<AdvancedStockMovement[]>(advancedStockMovements);
  const [purchaseOrders, setPurchaseOrders] = useState<AdvancedPurchaseOrder[]>(advancedPurchaseOrders);
  const [toast, setToast] = useState("");
  const [purchaseDraft, setPurchaseDraft] = useState({
    batchId: inventoryBatchRecords[0]?.id ?? "",
    cost: inventoryBatchRecords[0]?.purchaseCost ?? 1,
    expectedDate: "2026-07-05",
    quantity: 25,
    supplierId: inventoryBatchRecords[0]?.supplierId ?? ""
  });
  const [warehouseDraft, setWarehouseDraft] = useState({
    address: "",
    city: "",
    name: "",
    pincode: "",
    state: ""
  });
  const [adjustmentDraft, setAdjustmentDraft] = useState({
    adminNote: "",
    batchId: batches[0]?.id ?? "",
    quantity: 1,
    reason: "",
    type: "adjustment" as AdvancedStockMovementType
  });
  const [fefoDraft, setFefoDraft] = useState({
    minimumShelfLifeDays: 90,
    quantity: 3,
    variantId: batches[0]?.variantId ?? "",
    warehouseId: batches[0]?.warehouseId ?? ""
  });
  const [fefoMessage, setFefoMessage] = useState("");
  const inventoryRows = useMemo(() => buildInventoryRows(batches), [batches]);
  const expiryBuckets = useMemo(() => buildExpiryBuckets(batches), [batches]);
  const lowStockRows = inventoryRows.filter(
    (item) => item.availableStock <= item.lowStockThreshold || item.availableStock <= item.reorderPoint
  );
  const valuation = batches.reduce((total, batch) => total + batch.availableQuantity * batch.purchaseCost, 0);

  function createWarehouse() {
    if (!warehouseDraft.name.trim() || !warehouseDraft.pincode.trim()) {
      setToast("Warehouse name and pincode are required.");
      return;
    }

    const warehouse: AdvancedWarehouse = {
      address: warehouseDraft.address,
      city: warehouseDraft.city,
      code: `WH-${Date.now().toString().slice(-4)}`,
      id: `wh-${Date.now()}`,
      isActive: true,
      isDefault: warehouses.length === 0,
      name: warehouseDraft.name,
      pincode: warehouseDraft.pincode,
      state: warehouseDraft.state
    };
    setWarehouses((current) => [warehouse, ...current]);
    audit("admin.inventory.warehouse.create", "Warehouse", warehouse.id, { name: warehouse.name });
    setToast("Warehouse created.");
  }

  function toggleWarehouse(warehouseId: string) {
    setWarehouses((current) =>
      current.map((warehouse) =>
        warehouse.id === warehouseId ? { ...warehouse, isActive: !warehouse.isActive } : warehouse
      )
    );
    audit("admin.inventory.warehouse.toggle", "Warehouse", warehouseId);
    setToast("Warehouse status updated.");
  }

  function markDefaultWarehouse(warehouseId: string) {
    setWarehouses((current) =>
      current.map((warehouse) => ({ ...warehouse, isDefault: warehouse.id === warehouseId }))
    );
    audit("admin.inventory.warehouse.default", "Warehouse", warehouseId);
    setToast("Default warehouse updated.");
  }

  function receivePurchaseOrder(orderId: string) {
    const order = purchaseOrders.find((item) => item.id === orderId);

    if (!order) {
      setToast("Unable to receive this purchase order.");
      return;
    }

    let workingBatches = batches;
    let workingMovements = movements;
    const movementIds: string[] = [];

    for (const orderItem of order.items) {
      const sourceBatch = workingBatches.find((batch) => batch.variantId === orderItem.variantId);

      if (!sourceBatch) continue;

      const result = receivePurchaseOrderStock({
        adminId: session?.adminId ?? "admin-mock",
        batches: workingBatches,
        movements: workingMovements,
        quantity: orderItem.quantity,
        sourceBatch
      });
      workingBatches = result.batches;
      workingMovements = result.movements;
      movementIds.push(result.movement.id);
    }

    if (movementIds.length === 0) {
      setToast("No matching batch found for this purchase order.");
      return;
    }

    setBatches(workingBatches);
    setMovements(workingMovements);
    setPurchaseOrders((current) =>
      current.map((item) => (item.id === orderId ? { ...item, status: "received" } : item))
    );
    audit("admin.inventory.purchase_order.receive", "PurchaseOrder", orderId, {
      movementIds
    });
    setToast("Purchase order received and stock movement created.");
  }

  function createPurchaseOrder() {
    const selectedBatch = batches.find((batch) => batch.id === purchaseDraft.batchId);
    const supplierBatch = batches.find((batch) => batch.supplierId === purchaseDraft.supplierId) ?? selectedBatch;

    if (!selectedBatch) {
      setToast("Select a product / SKU before creating purchase order.");
      return;
    }

    if (purchaseDraft.quantity <= 0 || purchaseDraft.cost <= 0) {
      setToast("Purchase quantity and cost must be greater than zero.");
      return;
    }

    if (!purchaseDraft.expectedDate) {
      setToast("Expected date is required.");
      return;
    }

    const purchaseOrder: AdvancedPurchaseOrder = {
      expectedDate: purchaseDraft.expectedDate,
      id: `po-${Date.now()}`,
      items: [
        {
          cost: purchaseDraft.cost,
          productName: selectedBatch.productName,
          quantity: purchaseDraft.quantity,
          sku: selectedBatch.sku,
          variantId: selectedBatch.variantId
        }
      ],
      status: "ordered",
      supplierId: purchaseDraft.supplierId || selectedBatch.supplierId,
      supplierName: supplierBatch?.supplierName ?? selectedBatch.supplierName
    };

    setPurchaseOrders((current) => [purchaseOrder, ...current]);
    audit("admin.inventory.purchase_order.create", "PurchaseOrder", purchaseOrder.id, {
      quantity: purchaseDraft.quantity,
      sku: selectedBatch.sku,
      supplierId: purchaseOrder.supplierId
    });
    setToast("Purchase order created. Click Receive stock when goods arrive.");
  }

  function startPurchaseForSku(sku: string) {
    const batch = batches.find((item) => item.sku === sku);

    if (!batch) {
      setToast("Unable to create PO for this SKU.");
      return;
    }

    setPurchaseDraft({
      batchId: batch.id,
      cost: batch.purchaseCost,
      expectedDate: "2026-07-05",
      quantity: Math.max(25, 50 - batch.availableQuantity),
      supplierId: batch.supplierId
    });
    setActiveTab("Purchase Orders");
    setToast("Purchase order form prefilled from low stock alert.");
  }

  function submitAdjustment() {
    try {
      const result = applyStockAdjustment({
        adjustment: {
          adminId: session?.adminId ?? "",
          adminNote: adjustmentDraft.adminNote,
          batchId: adjustmentDraft.batchId,
          quantity: adjustmentDraft.quantity,
          reason: adjustmentDraft.reason,
          type: adjustmentDraft.type
        },
        batches,
        movements
      });
      setBatches(result.batches);
      setMovements(result.movements);
      audit("admin.inventory.stock_adjustment", "InventoryBatch", adjustmentDraft.batchId, {
        movementId: result.movement.id,
        quantity: adjustmentDraft.quantity,
        reason: adjustmentDraft.reason,
        type: adjustmentDraft.type
      });
      setToast("Stock adjustment saved with movement and audit log.");
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Adjustment failed.");
    }
  }

  function runFefoPreview() {
    const result = reserveStockByFefo({
      batches,
      quantity: fefoDraft.quantity,
      rule: {
        minimumShelfLifeDays: fefoDraft.minimumShelfLifeDays
      },
      variantId: fefoDraft.variantId,
      warehouseId: fefoDraft.warehouseId || undefined
    });
    const allocationText =
      result.allocations.length > 0
        ? result.allocations
            .map((allocation) => `${allocation.quantity} from ${allocation.batchNumber}`)
            .join(", ")
        : "No sellable batch found";
    setFefoMessage(
      `${allocationText}. Unfulfilled: ${result.unfulfilledQuantity}. Rejected: ${result.rejectedBatches.length}.`
    );
    audit("admin.inventory.fefo.preview", "InventoryBatch", fefoDraft.variantId, {
      allocationCount: result.allocations.length,
      minimumShelfLifeDays: fefoDraft.minimumShelfLifeDays
    });
  }

  return (
    <div className="grid gap-6">
      {toast ? <Toast message={toast} onDismiss={() => setToast("")} /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Inventory valuation" value={`Rs ${valuation.toLocaleString("en-IN")}`} />
        <Metric label="Available units" value={String(batches.reduce((sum, batch) => sum + batch.availableQuantity, 0))} />
        <Metric label="Low stock SKUs" tone="coral" value={String(lowStockRows.length)} />
        <Metric label="Expiry risk batches" tone="coral" value={String(expiryBuckets.risk.length)} />
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-card border border-black/10 bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-black ${
              activeTab === tab ? "bg-ink text-white" : "bg-mist text-ink"
            }`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" ? <OverviewTab rows={inventoryRows} /> : null}
      {activeTab === "Warehouses" ? (
        <WarehousesTab
          draft={warehouseDraft}
          markDefaultWarehouse={markDefaultWarehouse}
          onCreate={createWarehouse}
          setDraft={setWarehouseDraft}
          toggleWarehouse={toggleWarehouse}
          warehouses={warehouses}
        />
      ) : null}
      {activeTab === "Batches" ? <BatchesTab batches={batches} /> : null}
      {activeTab === "Movements" ? <MovementsTab movements={movements} /> : null}
      {activeTab === "Purchase Orders" ? (
        <PurchaseOrdersTab
          batches={batches}
          createPurchaseOrder={createPurchaseOrder}
          draft={purchaseDraft}
          orders={purchaseOrders}
          receivePurchaseOrder={receivePurchaseOrder}
          setDraft={setPurchaseDraft}
        />
      ) : null}
      {activeTab === "Adjustments" ? (
        <AdjustmentsTab
          batches={batches}
          draft={adjustmentDraft}
          setDraft={setAdjustmentDraft}
          submitAdjustment={submitAdjustment}
        />
      ) : null}
      {activeTab === "Expiry Alerts" ? <ExpiryAlertsTab buckets={expiryBuckets} /> : null}
      {activeTab === "Low Stock" ? <LowStockTab createPurchaseForSku={startPurchaseForSku} rows={lowStockRows} /> : null}
      {activeTab === "FEFO" ? (
        <FefoTab batches={batches} draft={fefoDraft} message={fefoMessage} runPreview={runFefoPreview} setDraft={setFefoDraft} />
      ) : null}
      {activeTab === "Reports" ? <ReportsTab /> : null}
    </div>
  );

  function audit(action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
    writeAdminAuditLog(session, {
      action,
      entityId,
      entityType,
      metadata
    });
  }
}

function OverviewTab({ rows }: { rows: ReturnType<typeof buildInventoryRows> }) {
  return (
    <AdminCard title="Inventory overview">
      <AdminTable
        columns={[
          "Product",
          "Variant / SKU",
          "Warehouse",
          "Total",
          "Available",
          "Reserved",
          "Damaged",
          "Expired",
          "Quarantine",
          "Threshold",
          "Reorder",
          "Expiry"
        ]}
        rows={rows.map((item) => [
          <span className="font-black text-ink" key="product">{item.productName}</span>,
          `${item.variantLabel} / ${item.sku}`,
          item.warehouseName,
          item.totalStock,
          item.availableStock,
          item.reservedStock,
          item.damagedStock,
          item.expiredStock,
          item.quarantineStock,
          item.lowStockThreshold,
          item.reorderPoint,
          <Badge key="expiry" tone={item.expiryStatus === "valid" ? "success" : "sale"}>{item.expiryStatus}</Badge>
        ])}
      />
    </AdminCard>
  );
}

function WarehousesTab({
  draft,
  markDefaultWarehouse,
  onCreate,
  setDraft,
  toggleWarehouse,
  warehouses
}: {
  draft: { address: string; city: string; name: string; pincode: string; state: string };
  markDefaultWarehouse: (warehouseId: string) => void;
  onCreate: () => void;
  setDraft: (draft: { address: string; city: string; name: string; pincode: string; state: string }) => void;
  toggleWarehouse: (warehouseId: string) => void;
  warehouses: AdvancedWarehouse[];
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <AdminCard title="Create warehouse">
        <div className="grid gap-3">
          <Input label="Warehouse name" onChange={(event) => setDraft({ ...draft, name: event.target.value })} value={draft.name} />
          <Input label="Address" onChange={(event) => setDraft({ ...draft, address: event.target.value })} value={draft.address} />
          <Input label="City" onChange={(event) => setDraft({ ...draft, city: event.target.value })} value={draft.city} />
          <Input label="State" onChange={(event) => setDraft({ ...draft, state: event.target.value })} value={draft.state} />
          <Input label="Pincode" onChange={(event) => setDraft({ ...draft, pincode: event.target.value })} value={draft.pincode} />
          <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-black text-white" onClick={onCreate} type="button">
            <Plus className="h-4 w-4" /> Create warehouse
          </button>
        </div>
      </AdminCard>
      <AdminCard title="Warehouse management">
        <AdminTable
          columns={["Warehouse", "Address", "City / State", "Pincode", "Status", "Default", "Actions"]}
          rows={warehouses.map((warehouse) => [
            <span className="font-black text-ink" key="name">{warehouse.name}</span>,
            warehouse.address,
            `${warehouse.city}, ${warehouse.state}`,
            warehouse.pincode,
            <Badge key="status" tone={warehouse.isActive ? "success" : "neutral"}>{warehouse.isActive ? "Active" : "Inactive"}</Badge>,
            warehouse.isDefault ? "Default" : "-",
            <div className="flex flex-wrap gap-2" key="actions">
              <button className="admin-action" onClick={() => toggleWarehouse(warehouse.id)} type="button">Toggle</button>
              <button className="admin-action" onClick={() => markDefaultWarehouse(warehouse.id)} type="button">Set default</button>
            </div>
          ])}
        />
      </AdminCard>
    </div>
  );
}

function BatchesTab({ batches }: { batches: InventoryBatchRecord[] }) {
  return (
    <AdminCard title="Batch management">
      <AdminTable
        columns={["Batch", "Product", "SKU", "Warehouse", "Mfg", "Expiry", "MRP", "Cost", "Received", "Available", "Reserved", "Damaged", "Expired", "QC", "Supplier", "Document"]}
        rows={batches.map((batch) => [
          <span className="font-black text-ink" key="batch">{batch.batchNumber}</span>,
          batch.productName,
          batch.sku,
          batch.warehouseName,
          batch.manufacturingDate ?? "-",
          batch.expiryDate,
          `Rs ${batch.mrpPerBatch}`,
          `Rs ${batch.purchaseCost}`,
          batch.receivedQuantity,
          batch.availableQuantity,
          batch.reservedQuantity,
          batch.damagedQuantity,
          batch.expiredQuantity,
          <Badge key="qc" tone={batch.qcStatus === "approved" ? "success" : batch.qcStatus === "pending" ? "neutral" : "sale"}>{batch.qcStatus}</Badge>,
          batch.supplierName,
          batch.invoiceDocumentUrl ? "Upload ready" : "Pending"
        ])}
      />
    </AdminCard>
  );
}

function MovementsTab({ movements }: { movements: AdvancedStockMovement[] }) {
  return (
    <AdminCard title="Stock movement report">
      <AdminTable
        columns={["Time", "Type", "SKU", "Batch", "Warehouse", "Qty", "Reason", "Admin"]}
        rows={movements.map((movement) => [
          new Date(movement.at).toLocaleString("en-IN"),
          movement.type,
          movement.sku,
          movement.batchNumber,
          movement.warehouseName,
          movement.quantity,
          movement.reason,
          movement.adminId
        ])}
      />
    </AdminCard>
  );
}

function PurchaseOrdersTab({
  batches,
  createPurchaseOrder,
  draft,
  orders,
  receivePurchaseOrder,
  setDraft
}: {
  batches: InventoryBatchRecord[];
  createPurchaseOrder: () => void;
  draft: { batchId: string; cost: number; expectedDate: string; quantity: number; supplierId: string };
  orders: AdvancedPurchaseOrder[];
  receivePurchaseOrder: (orderId: string) => void;
  setDraft: (draft: { batchId: string; cost: number; expectedDate: string; quantity: number; supplierId: string }) => void;
}) {
  const suppliers = [...new Map(batches.map((batch) => [batch.supplierId, batch])).values()];
  const selectedBatch = batches.find((batch) => batch.id === draft.batchId) ?? batches[0];

  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <AdminCard title="Add purchase order">
        <div className="grid gap-4">
          <SelectField label="Supplier" onChange={(value) => setDraft({ ...draft, supplierId: value })} value={draft.supplierId}>
            {suppliers.map((batch) => (
              <option key={batch.supplierId} value={batch.supplierId}>{batch.supplierName}</option>
            ))}
          </SelectField>
          <SelectField
            label="Product / SKU"
            onChange={(value) => {
              const batch = batches.find((item) => item.id === value);
              setDraft({
                ...draft,
                batchId: value,
                cost: batch?.purchaseCost ?? draft.cost,
                supplierId: batch?.supplierId ?? draft.supplierId
              });
            }}
            value={draft.batchId}
          >
            {batches.map((batch) => (
              <option key={batch.id} value={batch.id}>{batch.productName} / {batch.variantLabel} / {batch.sku}</option>
            ))}
          </SelectField>
          <div className="rounded-md border border-black/10 bg-mist p-3 text-sm font-semibold text-slate">
            Current stock: {selectedBatch?.availableQuantity ?? 0} available in {selectedBatch?.warehouseName ?? "warehouse"}.
          </div>
          <Input label="Expected date" onChange={(event) => setDraft({ ...draft, expectedDate: event.target.value })} type="date" value={draft.expectedDate} />
          <Input label="Purchase quantity" min={1} onChange={(event) => setDraft({ ...draft, quantity: Number(event.target.value) })} type="number" value={draft.quantity} />
          <Input label="Purchase cost per unit" min={1} onChange={(event) => setDraft({ ...draft, cost: Number(event.target.value) })} type="number" value={draft.cost} />
          <button className="focus-ring inline-flex items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-black text-white" onClick={createPurchaseOrder} type="button">
            <Plus className="h-4 w-4" /> Create purchase order
          </button>
        </div>
        <p className="mt-4 rounded-md bg-mint p-3 text-sm font-semibold text-forest">
          Goods arrive pachhi same PO row ma Receive stock dabavsho to stock add thase ane purchase_received movement create thase.
        </p>
      </AdminCard>

      <AdminCard title="Purchase orders">
        <AdminTable
          columns={["PO", "Supplier", "Expected", "Items", "Quantity", "Cost", "Status", "Receive"]}
          rows={orders.map((order) => [
            <span className="font-black text-ink" key="po">{order.id}</span>,
            order.supplierName,
            order.expectedDate,
            order.items.map((item) => item.sku).join(", "),
            order.items.reduce((sum, item) => sum + item.quantity, 0),
            `Rs ${order.items.reduce((sum, item) => sum + item.cost * item.quantity, 0).toLocaleString("en-IN")}`,
            <Badge key="status" tone={order.status === "received" ? "success" : "neutral"}>{order.status}</Badge>,
            <button className="admin-action" disabled={order.status === "received"} key="receive" onClick={() => receivePurchaseOrder(order.id)} type="button">
              <PackageCheck className="h-4 w-4" /> Receive stock
            </button>
          ])}
        />
        <p className="mt-4 rounded-md bg-mist p-3 text-sm font-semibold text-slate">
          Receiving stock creates or updates batches and records a purchase_received stock movement.
        </p>
      </AdminCard>
    </div>
  );
}

function AdjustmentsTab({
  batches,
  draft,
  setDraft,
  submitAdjustment
}: {
  batches: InventoryBatchRecord[];
  draft: { adminNote: string; batchId: string; quantity: number; reason: string; type: AdvancedStockMovementType };
  setDraft: (draft: { adminNote: string; batchId: string; quantity: number; reason: string; type: AdvancedStockMovementType }) => void;
  submitAdjustment: () => void;
}) {
  return (
    <AdminCard title="Stock adjustment">
      <div className="grid gap-4 lg:grid-cols-2">
        <SelectField label="Product / variant / batch / warehouse" onChange={(value) => setDraft({ ...draft, batchId: value })} value={draft.batchId}>
          {batches.map((batch) => (
            <option key={batch.id} value={batch.id}>{batch.productName} / {batch.sku} / {batch.batchNumber} / {batch.warehouseName}</option>
          ))}
        </SelectField>
        <SelectField label="Adjustment type" onChange={(value) => setDraft({ ...draft, type: value as AdvancedStockMovementType })} value={draft.type}>
          {movementTypes.map((type) => <option key={type} value={type}>{type}</option>)}
        </SelectField>
        <Input label="Quantity" min={1} onChange={(event) => setDraft({ ...draft, quantity: Number(event.target.value) })} type="number" value={draft.quantity} />
        <Input label="Reason" onChange={(event) => setDraft({ ...draft, reason: event.target.value })} value={draft.reason} />
        <label className="block lg:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-ink">Admin note</span>
          <textarea className="focus-ring min-h-24 w-full rounded-md border border-black/10 bg-white p-3 text-sm" onChange={(event) => setDraft({ ...draft, adminNote: event.target.value })} value={draft.adminNote} />
        </label>
      </div>
      <button className="focus-ring mt-4 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-black text-white" onClick={submitAdjustment} type="button">
        <Save className="h-4 w-4" /> Save adjustment
      </button>
      <p className="mt-3 text-xs font-bold text-slate">
        Manual adjustments require reason and admin ID. Negative available stock is blocked unless explicitly configured in the service.
      </p>
    </AdminCard>
  );
}

function ExpiryAlertsTab({ buckets }: { buckets: ReturnType<typeof buildExpiryBuckets> }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Expiring in 90 days" value={String(buckets.in90.length)} />
        <Metric label="Expiring in 60 days" value={String(buckets.in60.length)} />
        <Metric label="Expiring in 30 days" value={String(buckets.in30.length)} />
        <Metric label="Expired" tone="coral" value={String(buckets.expired.length)} />
      </div>
      <AdminCard title="Expiry risk report">
        <AdminTable
          columns={["Batch", "Product", "SKU", "Expiry", "Status", "Action"]}
          rows={buckets.risk.map((batch) => [
            batch.batchNumber,
            batch.productName,
            batch.sku,
            batch.expiryDate,
            <Badge key="status" tone="sale">{batch.expiryStatus}</Badge>,
            "Auto-hide expired stock and suggest near-expiry discounts"
          ])}
        />
      </AdminCard>
    </div>
  );
}

function LowStockTab({
  createPurchaseForSku,
  rows
}: {
  createPurchaseForSku: (sku: string) => void;
  rows: ReturnType<typeof buildInventoryRows>;
}) {
  return (
    <AdminCard title="Low stock alerts">
      <AdminTable
        columns={["Product", "SKU", "Warehouse", "Available", "Threshold", "Reorder", "Action"]}
        rows={rows.map((item) => [
          item.productName,
          item.sku,
          item.warehouseName,
          <span className="font-black text-coral" key="available">{item.availableStock}</span>,
          item.lowStockThreshold,
          item.reorderPoint,
          <button className="admin-action" key="po" onClick={() => createPurchaseForSku(item.sku)} type="button">Create purchase order</button>
        ])}
      />
    </AdminCard>
  );
}

function FefoTab({
  batches,
  draft,
  message,
  runPreview,
  setDraft
}: {
  batches: InventoryBatchRecord[];
  draft: { minimumShelfLifeDays: number; quantity: number; variantId: string; warehouseId: string };
  message: string;
  runPreview: () => void;
  setDraft: (draft: { minimumShelfLifeDays: number; quantity: number; variantId: string; warehouseId: string }) => void;
}) {
  const variants = [...new Map(batches.map((batch) => [batch.variantId, batch])).values()];
  const warehouses = [...new Map(batches.map((batch) => [batch.warehouseId, batch])).values()];

  return (
    <AdminCard title="FEFO reservation preview">
      <div className="grid gap-4 lg:grid-cols-4">
        <SelectField label="Variant / SKU" onChange={(value) => setDraft({ ...draft, variantId: value })} value={draft.variantId}>
          {variants.map((batch) => <option key={batch.variantId} value={batch.variantId}>{batch.sku}</option>)}
        </SelectField>
        <SelectField label="Warehouse" onChange={(value) => setDraft({ ...draft, warehouseId: value })} value={draft.warehouseId}>
          {warehouses.map((batch) => <option key={batch.warehouseId} value={batch.warehouseId}>{batch.warehouseName}</option>)}
        </SelectField>
        <Input label="Quantity" min={1} onChange={(event) => setDraft({ ...draft, quantity: Number(event.target.value) })} type="number" value={draft.quantity} />
        <Input label="Minimum shelf life days" min={0} onChange={(event) => setDraft({ ...draft, minimumShelfLifeDays: Number(event.target.value) })} type="number" value={draft.minimumShelfLifeDays} />
      </div>
      <button className="focus-ring mt-4 inline-flex items-center gap-2 rounded-md bg-ink px-4 py-3 text-sm font-black text-white" onClick={runPreview} type="button">
        <RotateCw className="h-4 w-4" /> Run FEFO preview
      </button>
      {message ? <p className="mt-4 rounded-md bg-mint p-3 text-sm font-bold text-forest">{message}</p> : null}
      <p className="mt-3 text-sm leading-6 text-slate">
        FEFO sorts sellable batches by earliest expiry, skips expired or QC-rejected batches, and enforces the configured minimum shelf life for delivery.
      </p>
    </AdminCard>
  );
}

function ReportsTab() {
  return (
    <AdminCard title="Inventory reports">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {inventoryReports.map((report) => (
          <div className="rounded-md border border-black/10 bg-mist p-4" key={report.name}>
            <ClipboardList className="h-5 w-5 text-forest" />
            <p className="mt-3 font-black text-ink">{report.name}</p>
            <p className="mt-1 text-sm leading-6 text-slate">{report.description}</p>
            <button className="admin-action mt-3" type="button">Generate report</button>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

function SelectField({
  children,
  label,
  onChange,
  value
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <select className="focus-ring h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm text-ink" onChange={(event) => onChange(event.target.value)} value={value}>
        {children}
      </select>
    </label>
  );
}

function Metric({ label, tone, value }: { label: string; tone?: "coral"; value: string }) {
  return (
    <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className={`mt-2 text-3xl font-black ${tone === "coral" ? "text-coral" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-card border border-black/10 bg-white p-4 text-sm font-bold text-ink shadow-card">
      <AlertTriangle className="h-5 w-5 text-forest" />
      <span>{message}</span>
      <button className="ml-auto text-slate" onClick={onDismiss} type="button">Dismiss</button>
    </div>
  );
}

function buildInventoryRows(batches: InventoryBatchRecord[]) {
  return batches.map((batch) => {
    const quarantineStock = batch.qcStatus === "pending" || batch.qcStatus === "rejected" ? 4 : 0;
    const expiryStatus = expiryStatusFor(batch.expiryDate);

    return {
      availableStock: batch.availableQuantity,
      damagedStock: batch.damagedQuantity,
      expiredStock: batch.expiredQuantity,
      expiryStatus,
      lowStockThreshold: batch.sku.includes("CRTN") ? 15 : 20,
      productName: batch.productName,
      quarantineStock,
      reorderPoint: batch.sku.includes("CRTN") ? 25 : 35,
      reservedStock: batch.reservedQuantity,
      sku: batch.sku,
      totalStock:
        batch.availableQuantity +
        batch.reservedQuantity +
        batch.damagedQuantity +
        batch.expiredQuantity +
        quarantineStock,
      variantLabel: batch.variantLabel,
      warehouseName: batch.warehouseName
    };
  });
}

function buildExpiryBuckets(batches: InventoryBatchRecord[]) {
  const enriched = batches.map((batch) => ({ ...batch, expiryStatus: expiryStatusFor(batch.expiryDate) }));

  return {
    expired: enriched.filter((batch) => batch.expiryStatus === "expired"),
    in30: enriched.filter((batch) => batch.expiryStatus === "expiring_30"),
    in60: enriched.filter((batch) => batch.expiryStatus === "expiring_60"),
    in90: enriched.filter((batch) => batch.expiryStatus === "expiring_90"),
    risk: enriched.filter((batch) => batch.expiryStatus !== "valid")
  };
}

function expiryStatusFor(expiryDate: string) {
  const days = Math.ceil((new Date(expiryDate).getTime() - new Date("2026-06-29T00:00:00.000Z").getTime()) / 86400000);

  if (days < 0) return "expired";
  if (days <= 30) return "expiring_30";
  if (days <= 60) return "expiring_60";
  if (days <= 90) return "expiring_90";
  return "valid";
}
