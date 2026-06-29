"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  ClipboardCheck,
  Download,
  FileText,
  PackageCheck,
  RefreshCcw,
  RotateCcw,
  Search,
  Truck
} from "lucide-react";
import { adminOrderReports, adminOrders } from "@/mock/adminOrders";
import { advancedStockMovements, advancedWarehouses, inventoryBatchRecords } from "@/mock/adminInventory";
import type { AdvancedStockMovement, InventoryBatchRecord } from "@/types/inventory";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminPaymentStatus,
  AdminShipmentSnapshot,
  AdminShipmentStatus,
  OrderFilters,
  PaymentMode,
  ReturnQcDecision,
  ReturnStatus
} from "@/types/orderOps";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import {
  addInternalNote,
  approveReturn,
  assignCourier,
  cancelOrder,
  completeReturnQc,
  markOrderPacked,
  markOrderShipped,
  markRefunded,
  rejectReturn,
  requestReturn,
  reserveOrderStock,
  updateShipmentStatus
} from "@/lib/orders/orderOpsService";
import { checkPincodeServiceability, fetchNdrRtoPlaceholder, fetchTrackingPlaceholder } from "@/lib/services/shipping";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";

const orderStatuses: Array<"all" | AdminOrderStatus> = [
  "all",
  "pending",
  "confirmed",
  "packed",
  "shipped",
  "out_for_delivery",
  "delivered",
  "cancelled",
  "return_requested",
  "returned",
  "refunded",
  "rto"
];
const paymentStatuses: Array<"all" | AdminPaymentStatus> = ["all", "pending", "paid", "failed", "refunded", "cod_pending"];
const paymentModes: Array<"all" | PaymentMode> = ["all", "prepaid", "cod"];
const shipmentStatuses: Array<"all" | AdminShipmentStatus> = [
  "all",
  "pending",
  "serviceable",
  "label_created",
  "picked_up",
  "in_transit",
  "out_for_delivery",
  "delivered",
  "ndr",
  "rto"
];
const returnStatuses: Array<"all" | ReturnStatus> = [
  "all",
  "none",
  "requested",
  "approved",
  "rejected",
  "pickup_scheduled",
  "received",
  "qc_checked",
  "restocked",
  "damaged",
  "quarantined",
  "refunded"
];

const initialFilters: OrderFilters = {
  customer: "",
  dateFrom: "",
  dateTo: "",
  orderId: "",
  orderStatus: "all",
  paymentMode: "all",
  paymentStatus: "all",
  returnStatus: "all",
  shipmentStatus: "all"
};

export function OrderManagementClient({ initialOrderNumber }: { initialOrderNumber?: string }) {
  const { session } = useAdminSession();
  const [orders, setOrders] = useState(adminOrders);
  const [batches, setBatches] = useState<InventoryBatchRecord[]>(inventoryBatchRecords);
  const [movements, setMovements] = useState<AdvancedStockMovement[]>(advancedStockMovements);
  const [filters, setFilters] = useState<OrderFilters>(initialFilters);
  const [selectedOrderNumber, setSelectedOrderNumber] = useState(initialOrderNumber ?? adminOrders[0]?.orderNumber ?? "");
  const [toast, setToast] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [returnReason, setReturnReason] = useState("Customer requested return");
  const [cancelReason, setCancelReason] = useState("Customer cancellation request");
  const [rejectReason, setRejectReason] = useState("Return policy conditions not met");
  const [carrier, setCarrier] = useState<AdminOrder["shipment"]["carrier"]>("shiprocket");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [shippingLoading, setShippingLoading] = useState(false);
  const [qcDecision, setQcDecision] = useState<ReturnQcDecision>("restock");
  const [trackingMessage, setTrackingMessage] = useState("");
  const adminId = session?.adminId ?? "admin-demo";

  const selectedOrder = orders.find((order) => order.orderNumber === selectedOrderNumber) ?? orders[0];

  const filteredOrders = useMemo(
    () =>
      orders.filter((order) => {
        const placed = order.placedAt.slice(0, 10);
        const matchesOrderId = order.orderNumber.toLowerCase().includes(filters.orderId.toLowerCase());
        const matchesCustomer = [order.customerName, order.customerEmail, order.customerPhone]
          .join(" ")
          .toLowerCase()
          .includes(filters.customer.toLowerCase());
        const matchesStatus = filters.orderStatus === "all" || order.status === filters.orderStatus;
        const matchesPayment = filters.paymentStatus === "all" || order.payment.status === filters.paymentStatus;
        const matchesPaymentMode = filters.paymentMode === "all" || order.payment.method === filters.paymentMode;
        const matchesShipment = filters.shipmentStatus === "all" || order.shipment.status === filters.shipmentStatus;
        const matchesReturn = filters.returnStatus === "all" || order.return.status === filters.returnStatus;
        const matchesFrom = !filters.dateFrom || placed >= filters.dateFrom;
        const matchesTo = !filters.dateTo || placed <= filters.dateTo;

        return (
          matchesOrderId &&
          matchesCustomer &&
          matchesStatus &&
          matchesPayment &&
          matchesPaymentMode &&
          matchesShipment &&
          matchesReturn &&
          matchesFrom &&
          matchesTo
        );
      }),
    [filters, orders]
  );

  const metrics = useMemo(() => {
    const refundAmount = orders
      .filter((order) => order.status === "refunded" || order.return.refundStatus === "processed")
      .reduce((sum, order) => sum + order.totalAmount, 0);

    return {
      codPending: orders.filter((order) => order.payment.status === "cod_pending").length,
      pending: orders.filter((order) => ["pending", "confirmed", "packed"].includes(order.status)).length,
      refunds: refundAmount,
      returnRequests: orders.filter((order) => order.return.status === "requested").length,
      rto: orders.filter((order) => order.status === "rto" || order.shipment.status === "rto").length,
      shipped: orders.filter((order) => order.status === "shipped").length,
      total: orders.length
    };
  }, [orders]);

  function setFilter<K extends keyof OrderFilters>(key: K, value: OrderFilters[K]) {
    setFilters((current) => ({
      ...current,
      [key]: value
    }));
  }

  function replaceOrder(nextOrder: AdminOrder, auditAction?: string, metadata?: Record<string, unknown>) {
    setOrders((current) => current.map((order) => (order.id === nextOrder.id ? nextOrder : order)));
    setSelectedOrderNumber(nextOrder.orderNumber);

    if (auditAction) {
      writeAdminAuditLog(session, {
        action: auditAction,
        entityId: nextOrder.id,
        entityType: "order",
        metadata: {
          orderNumber: nextOrder.orderNumber,
          status: nextOrder.status,
          ...metadata
        }
      });
    }
  }

  function runInventoryOperation(
    operation: () => {
      batches: InventoryBatchRecord[];
      movements: AdvancedStockMovement[];
      order: AdminOrder;
    },
    successMessage: string,
    auditAction: string
  ) {
    try {
      const result = operation();
      setBatches(result.batches);
      setMovements(result.movements);
      replaceOrder(result.order, auditAction);
      setToast(successMessage);
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Order operation failed.");
    }
  }

  async function handleAssignCourier() {
    if (!selectedOrder) return;

    setShippingLoading(true);
    setTrackingMessage("");

    try {
      if (carrier === "shiprocket") {
        const response = await fetch("/api/shipping/shiprocket/create-shipment", {
          body: JSON.stringify({
            order: selectedOrder,
            weightKg: Math.max(0.5, selectedOrder.items.reduce((sum, item) => sum + item.quantity * 0.5, 0))
          }),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        });
        const data = (await response.json()) as {
          message?: string;
          shipment?: Partial<AdminShipmentSnapshot>;
        };

        if (!response.ok || !data.shipment) {
          throw new Error(data.message ?? "Shiprocket shipment creation failed.");
        }

        const nextOrder = assignCourier({
          adminId,
          carrier,
          order: selectedOrder,
          shipment: data.shipment,
          trackingNumber
        });
        replaceOrder(nextOrder, "order.assign_shiprocket", {
          awbCode: data.shipment.awbCode,
          courierName: data.shipment.courierName,
          shipmentId: data.shipment.shipmentId
        });
        setToast(data.message ?? "Shiprocket shipment created.");
      } else {
        const nextOrder = assignCourier({
          adminId,
          carrier,
          order: selectedOrder,
          trackingNumber
        });
        replaceOrder(nextOrder, "order.assign_courier", { carrier });
        setToast("Courier assigned and label placeholder generated.");
      }
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Unable to assign courier.");
    } finally {
      setShippingLoading(false);
    }
  }

  async function handleFetchTracking() {
    if (!selectedOrder) return;

    const trackingId = selectedOrder.shipment.awbCode ?? selectedOrder.shipment.trackingNumber ?? selectedOrder.shipment.shipmentId;

    if (!trackingId) {
      setTrackingMessage("Assign a courier before fetching tracking.");
      return;
    }

    setShippingLoading(true);

    try {
      if (selectedOrder.shipment.carrier === "shiprocket") {
        const response = await fetch("/api/shipping/shiprocket/tracking", {
          body: JSON.stringify({ trackingNumber: trackingId }),
          headers: { "Content-Type": "application/json" },
          method: "POST"
        });
        const data = (await response.json()) as {
          message?: string;
          tracking?: {
            events: Array<{ message: string; status: AdminShipmentStatus | "unknown" }>;
            rawStatus?: string;
            status: AdminShipmentStatus;
            trackingNumber: string;
          };
        };

        if (!response.ok || !data.tracking) {
          throw new Error(data.message ?? "Unable to fetch Shiprocket tracking.");
        }

        const firstEvent = data.tracking.events[0];
        const nextOrder = updateShipmentStatus(
          selectedOrder,
          data.tracking.status,
          adminId,
          firstEvent?.message ?? data.tracking.rawStatus ?? "Shiprocket tracking synced."
        );
        replaceOrder(nextOrder, "order.fetch_shiprocket_tracking", {
          status: data.tracking.status,
          trackingNumber: data.tracking.trackingNumber
        });
        setTrackingMessage(`${label(data.tracking.status)}: ${firstEvent?.message ?? "Shiprocket tracking synced."}`);
      } else {
        const tracking = fetchTrackingPlaceholder(trackingId);
        setTrackingMessage(`${tracking.status}: ${tracking.events[0].message}`);
      }
    } catch (error) {
      setTrackingMessage(error instanceof Error ? error.message : "Tracking fetch failed.");
    } finally {
      setShippingLoading(false);
    }
  }

  async function handleCheckServiceability() {
    if (!selectedOrder) return;

    setShippingLoading(true);

    try {
      if (carrier !== "shiprocket") {
        const local = checkPincodeServiceability({
          carrier,
          pincode: selectedOrder.shippingAddress.postalCode,
          warehousePincode: advancedWarehouses[0]?.pincode
        });
        setToast(local.message);
        return;
      }

      const response = await fetch("/api/shipping/shiprocket/serviceability", {
        body: JSON.stringify({
          cod: selectedOrder.payment.method === "cod",
          deliveryPostcode: selectedOrder.shippingAddress.postalCode,
          pickupPostcode: advancedWarehouses[0]?.pincode ?? "400001",
          weightKg: Math.max(0.5, selectedOrder.items.reduce((sum, item) => sum + item.quantity * 0.5, 0))
        }),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const data = (await response.json()) as {
        courierName?: string;
        estimatedDays?: string;
        isServiceable?: boolean;
        message?: string;
        rateEstimate?: number;
      };

      if (!response.ok) {
        throw new Error(data.message ?? "Shiprocket serviceability check failed.");
      }

      setToast(
        `${data.isServiceable ? "Serviceable" : "Review needed"}: ${data.courierName ?? "Shiprocket"} ${data.estimatedDays ? `(${data.estimatedDays})` : ""}${data.rateEstimate ? `, approx Rs ${data.rateEstimate}` : ""}. ${data.message ?? ""}`.trim()
      );
    } catch (error) {
      setToast(error instanceof Error ? error.message : "Unable to check serviceability.");
    } finally {
      setShippingLoading(false);
    }
  }

  if (!selectedOrder) {
    return <AdminCard title="Orders">No orders available.</AdminCard>;
  }

  const serviceability = checkPincodeServiceability({
    carrier: selectedOrder.shipment.carrier,
    pincode: selectedOrder.shippingAddress.postalCode,
    warehousePincode: advancedWarehouses[0]?.pincode
  });

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="rounded-md border border-black/10 bg-mint px-4 py-3 text-sm font-semibold text-forest">
          {toast}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Metric label="Total orders" value={metrics.total} />
        <Metric label="Pending ops" value={metrics.pending} />
        <Metric label="Shipped" value={metrics.shipped} />
        <Metric label="COD pending" value={metrics.codPending} />
        <Metric label="Return requests" value={metrics.returnRequests} />
        <Metric label="Refund value" value={`Rs ${metrics.refunds.toLocaleString("en-IN")}`} />
      </div>

      <AdminCard title="Order filters">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <Input
            label="Order ID"
            onChange={(event) => setFilter("orderId", event.target.value)}
            placeholder="FS-1001"
            value={filters.orderId}
          />
          <Input
            label="Customer"
            onChange={(event) => setFilter("customer", event.target.value)}
            placeholder="Name, email, phone"
            value={filters.customer}
          />
          <Select
            label="Order status"
            onChange={(event) => setFilter("orderStatus", event.target.value as OrderFilters["orderStatus"])}
            value={filters.orderStatus}
          >
            {orderStatuses.map((status) => (
              <option key={status} value={status}>
                {label(status)}
              </option>
            ))}
          </Select>
          <Select
            label="Payment"
            onChange={(event) => setFilter("paymentStatus", event.target.value as OrderFilters["paymentStatus"])}
            value={filters.paymentStatus}
          >
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>
                {label(status)}
              </option>
            ))}
          </Select>
          <Select
            label="COD/prepaid"
            onChange={(event) => setFilter("paymentMode", event.target.value as OrderFilters["paymentMode"])}
            value={filters.paymentMode}
          >
            {paymentModes.map((mode) => (
              <option key={mode} value={mode}>
                {label(mode)}
              </option>
            ))}
          </Select>
          <Select
            label="Shipment"
            onChange={(event) => setFilter("shipmentStatus", event.target.value as OrderFilters["shipmentStatus"])}
            value={filters.shipmentStatus}
          >
            {shipmentStatuses.map((status) => (
              <option key={status} value={status}>
                {label(status)}
              </option>
            ))}
          </Select>
          <Select
            label="Return"
            onChange={(event) => setFilter("returnStatus", event.target.value as OrderFilters["returnStatus"])}
            value={filters.returnStatus}
          >
            {returnStatuses.map((status) => (
              <option key={status} value={status}>
                {label(status)}
              </option>
            ))}
          </Select>
          <Input
            label="From"
            onChange={(event) => setFilter("dateFrom", event.target.value)}
            type="date"
            value={filters.dateFrom}
          />
          <Input
            label="To"
            onChange={(event) => setFilter("dateTo", event.target.value)}
            type="date"
            value={filters.dateTo}
          />
          <button className="admin-action mt-7 h-11 justify-center" onClick={() => setFilters(initialFilters)} type="button">
            <Search className="h-4 w-4" /> Reset filters
          </button>
        </div>
      </AdminCard>

      <AdminCard title={`Order queue (${filteredOrders.length})`}>
        <AdminTable
          columns={["Order", "Customer", "Payment", "Status", "Shipment", "Return", "Total", "Actions"]}
          rows={filteredOrders.map((order) => [
            <div key="order">
              <p className="font-black text-ink">{order.orderNumber}</p>
              <p className="text-xs text-slate">{formatDate(order.placedAt)}</p>
            </div>,
            <div key="customer">
              <p className="font-semibold text-ink">{order.customerName}</p>
              <p className="text-xs text-slate">{order.customerPhone}</p>
            </div>,
            <div key="payment" className="space-y-1">
              <Badge tone={order.payment.method === "cod" ? "sale" : "success"}>{label(order.payment.method)}</Badge>
              <p className="text-xs text-slate">{label(order.payment.status)}</p>
            </div>,
            <Badge key="status" tone={order.status === "cancelled" ? "sale" : order.status === "delivered" ? "success" : "dark"}>
              {label(order.status)}
            </Badge>,
            <div key="shipment">
              <p className="font-semibold text-ink">{label(order.shipment.status)}</p>
              <p className="text-xs text-slate">{order.shipment.trackingNumber ?? "No tracking"}</p>
            </div>,
            <Badge key="return" tone={order.return.status === "none" ? "neutral" : "sale"}>{label(order.return.status)}</Badge>,
            <p key="total" className="font-black text-ink">
              Rs {order.totalAmount.toLocaleString("en-IN")}
            </p>,
            <button
              className="admin-action"
              key="action"
              onClick={() => setSelectedOrderNumber(order.orderNumber)}
              type="button"
            >
              Open
            </button>
          ])}
        />
      </AdminCard>

      <div className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,0.75fr)]">
        <div className="min-w-0 space-y-6">
          <AdminCard title={`${selectedOrder.orderNumber} details`}>
            <div className="grid gap-4 md:grid-cols-3">
              <InfoBlock label="Customer" value={selectedOrder.customerName} helper={selectedOrder.customerEmail} />
              <InfoBlock label="Phone" value={selectedOrder.customerPhone} helper={selectedOrder.codConfirmed ? "COD verified" : "COD verification pending"} />
              <InfoBlock label="Pincode serviceability" value={serviceability.isServiceable ? "Serviceable" : "Review needed"} helper={serviceability.message} />
            </div>
            <button className="admin-action mt-4" disabled={shippingLoading} onClick={handleCheckServiceability} type="button">
              <Truck className="h-4 w-4" /> Live pincode check
            </button>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <AddressBlock label="Shipping address" address={selectedOrder.shippingAddress} />
              <AddressBlock label="Billing address" address={selectedOrder.billingAddress} />
            </div>
          </AdminCard>

          <AdminCard title="Order items and batch snapshots">
            <AdminTable
              columns={["Product", "Variant/SKU", "Batch", "Qty", "HSN/GST", "Amount"]}
              rows={selectedOrder.items.map((item) => [
                <p className="font-semibold text-ink" key="product">{item.productName}</p>,
                <div key="variant">
                  <p>{item.variantLabel}</p>
                  <p className="text-xs text-slate">{item.sku}</p>
                </div>,
                <div key="batch">
                  <p className="font-semibold text-ink">{item.batchNumber ?? "Not reserved"}</p>
                  <p className="text-xs text-slate">
                    {item.batchAllocations?.length
                      ? item.batchAllocations.map((allocation) => `${allocation.batchNumber} x ${allocation.quantity}`).join(", ")
                      : item.batchId ?? "FEFO pending"}
                  </p>
                </div>,
                item.quantity,
                <p key="tax">{item.hsnCode} / {item.gstRate}%</p>,
                <p key="amount" className="font-black text-ink">Rs {item.totalAmount.toLocaleString("en-IN")}</p>
              ])}
            />
          </AdminCard>

          <AdminCard title="Fulfillment workflow">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <button
                className="admin-action justify-center"
                onClick={() =>
                  runInventoryOperation(
                    () =>
                      reserveOrderStock({
                        adminId,
                        batches,
                        minimumShelfLifeDays: 45,
                        movements,
                        order: selectedOrder
                      }),
                    "Stock reserved using FEFO.",
                    "order.reserve_stock"
                  )
                }
                type="button"
              >
                <PackageCheck className="h-4 w-4" /> Reserve FEFO
              </button>
              <button
                className="admin-action justify-center"
                onClick={() => {
                  const nextOrder = markOrderPacked(selectedOrder, adminId);
                  replaceOrder(nextOrder, "order.mark_packed");
                  setToast("Order marked packed.");
                }}
                type="button"
              >
                <ClipboardCheck className="h-4 w-4" /> Mark packed
              </button>
              <button
                className="admin-action justify-center"
                onClick={() => {
                  const nextOrder = updateShipmentStatus(selectedOrder, "out_for_delivery", adminId, "Courier status placeholder updated.");
                  replaceOrder(nextOrder, "order.out_for_delivery");
                  setToast("Shipment marked out for delivery.");
                }}
                type="button"
              >
                <Truck className="h-4 w-4" /> Out for delivery
              </button>
              <button
                className="admin-action justify-center"
                onClick={() => {
                  const nextOrder = updateShipmentStatus(selectedOrder, "delivered", adminId, "Delivery confirmation placeholder.");
                  replaceOrder(nextOrder, "order.delivered");
                  setToast("Order marked delivered.");
                }}
                type="button"
              >
                <ClipboardCheck className="h-4 w-4" /> Delivered
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_1fr_auto]">
              <Select label="Courier" onChange={(event) => setCarrier(event.target.value as AdminOrder["shipment"]["carrier"])} value={carrier}>
                <option value="shiprocket">Shiprocket</option>
                <option value="delhivery">Delhivery</option>
                <option value="bluedart">BlueDart</option>
                <option value="manual">Manual</option>
              </Select>
              <Input
                label="Tracking number"
                onChange={(event) => setTrackingNumber(event.target.value)}
                placeholder="Optional"
                value={trackingNumber}
              />
              <button
                className="admin-action mt-7 h-11 justify-center"
                disabled={shippingLoading}
                onClick={handleAssignCourier}
                type="button"
              >
                {shippingLoading ? "Working..." : "Assign courier"}
              </button>
            </div>

            <div className="mt-3 flex flex-wrap gap-3">
              <button
                className="admin-action"
                onClick={() =>
                  runInventoryOperation(
                    () =>
                      markOrderShipped({
                        adminId,
                        batches,
                        movements,
                        order: selectedOrder
                      }),
                    "Order shipped and reserved stock consumed.",
                    "order.mark_shipped"
                  )
                }
                type="button"
              >
                <Truck className="h-4 w-4" /> Mark shipped
              </button>
              <button
                className="admin-action"
                disabled={shippingLoading}
                onClick={handleFetchTracking}
                type="button"
              >
                Fetch tracking
              </button>
              <button
                className="admin-action"
                onClick={() => {
                  const ndr = fetchNdrRtoPlaceholder(selectedOrder.shipment.trackingNumber ?? "TRACKING-PENDING");
                  setTrackingMessage(`NDR/RTO placeholder: ${ndr.ndrReason}, risk ${ndr.rtoRisk}`);
                }}
                type="button"
              >
                NDR/RTO check
              </button>
              <button className="admin-action" type="button">
                <FileText className="h-4 w-4" /> Generate packing slip
              </button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <InfoBlock label="Shipment ID" value={selectedOrder.shipment.shipmentId ?? "Not created"} helper={selectedOrder.shipment.providerOrderId ? `Order ${selectedOrder.shipment.providerOrderId}` : undefined} />
              <InfoBlock label="Courier" value={selectedOrder.shipment.courierName ?? label(selectedOrder.shipment.carrier)} helper={selectedOrder.shipment.awbCode ? `AWB ${selectedOrder.shipment.awbCode}` : "AWB pending"} />
              <InfoBlock label="Rate estimate" value={selectedOrder.shipment.rateEstimate ? `Rs ${selectedOrder.shipment.rateEstimate}` : "Pending"} helper={selectedOrder.shipment.estimatedDelivery} />
              <InfoBlock label="Label" value={selectedOrder.shipment.labelUrl ? "Ready" : "Pending"} helper={selectedOrder.shipment.labelUrl ?? "Packing slip fallback"} />
            </div>
            {trackingMessage ? <p className="mt-3 text-sm font-semibold text-forest">{trackingMessage}</p> : null}
          </AdminCard>

          <AdminCard title="Timeline and internal notes">
            <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
              <div className="space-y-3">
                {selectedOrder.timeline.map((entry) => (
                  <div className="rounded-md border border-black/10 p-3" key={entry.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-black text-ink">{entry.title}</p>
                      <span className="text-xs font-semibold text-slate">{formatDate(entry.at)}</span>
                    </div>
                    <p className="mt-1 text-sm text-graphite">{entry.note ?? "No note"}</p>
                    <p className="mt-1 text-xs font-semibold text-slate">By {entry.actor}</p>
                  </div>
                ))}
              </div>
              <div>
                <Input
                  label="Add internal note"
                  onChange={(event) => setInternalNote(event.target.value)}
                  placeholder="Ops note"
                  value={internalNote}
                />
                <button
                  className="admin-action mt-3 w-full justify-center"
                  onClick={() => {
                    try {
                      const nextOrder = addInternalNote(selectedOrder, session?.fullName ?? adminId, internalNote);
                      replaceOrder(nextOrder, "order.internal_note");
                      setInternalNote("");
                      setToast("Internal note added.");
                    } catch (error) {
                      setToast(error instanceof Error ? error.message : "Could not add note.");
                    }
                  }}
                  type="button"
                >
                  Add note
                </button>
                <div className="mt-4 space-y-3">
                  {selectedOrder.internalNotes.map((note) => (
                    <div className="rounded-md bg-mist p-3" key={note.id}>
                      <p className="text-sm text-graphite">{note.note}</p>
                      <p className="mt-2 text-xs font-semibold text-slate">{note.adminName} - {formatDate(note.at)}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </AdminCard>
        </div>

        <div className="min-w-0 space-y-6">
          <AdminCard title="Payment, coupon and COD">
            <div className="space-y-3 text-sm">
              <Row label="Provider" value={label(selectedOrder.payment.provider)} />
              <Row label="Payment status" value={label(selectedOrder.payment.status)} />
              <Row label="Payment mode" value={label(selectedOrder.payment.method)} />
              <Row label="Coupon" value={selectedOrder.couponCode ?? "No coupon"} />
              <Row label="COD confirmed" value={selectedOrder.codConfirmed ? "Yes" : "No"} />
              <Row label="COD risk tag" value={label(selectedOrder.codRisk)} />
              <button
                className="admin-action w-full justify-center"
                onClick={() => {
                  replaceOrder(
                    {
                      ...selectedOrder,
                      codConfirmed: true,
                      payment: {
                        ...selectedOrder.payment,
                        status: selectedOrder.payment.method === "cod" ? "pending" : selectedOrder.payment.status
                      }
                    },
                    "order.cod_confirm"
                  );
                  setToast("COD verification placeholder completed.");
                }}
                type="button"
              >
                Confirm COD
              </button>
            </div>
          </AdminCard>

          <AdminCard title="Invoice placeholder">
            <div className="space-y-3 text-sm">
              <Row label="Invoice no." value={selectedOrder.invoiceNumber ?? `INV-${selectedOrder.orderNumber}`} />
              <Row label="Order date" value={formatDate(selectedOrder.placedAt)} />
              <Row label="Subtotal" value={`Rs ${selectedOrder.subtotal.toLocaleString("en-IN")}`} />
              <Row label="Discount" value={`Rs ${selectedOrder.discountAmount.toLocaleString("en-IN")}`} />
              <Row label="Shipping" value={`Rs ${selectedOrder.shippingAmount.toLocaleString("en-IN")}`} />
              <Row label="Tax placeholder" value={`Rs ${selectedOrder.taxAmount.toLocaleString("en-IN")}`} />
              <Row label="Grand total" value={`Rs ${selectedOrder.totalAmount.toLocaleString("en-IN")}`} strong />
              <button className="admin-action w-full justify-center" type="button">
                <Download className="h-4 w-4" /> Download PDF placeholder
              </button>
            </div>
          </AdminCard>

          <AdminCard title="Return, refund and cancellation">
            <div className="space-y-4">
              <Input
                label="Return reason"
                onChange={(event) => setReturnReason(event.target.value)}
                value={returnReason}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  className="admin-action justify-center"
                  onClick={() => {
                    const nextOrder = requestReturn(selectedOrder, adminId, returnReason);
                    replaceOrder(nextOrder, "order.return_request");
                    setToast("Return request created.");
                  }}
                  type="button"
                >
                  <RotateCcw className="h-4 w-4" /> Request
                </button>
                <button
                  className="admin-action justify-center"
                  onClick={() => {
                    const nextOrder = approveReturn(selectedOrder, adminId);
                    replaceOrder(nextOrder, "order.return_approve");
                    setToast("Return approved and pickup placeholder created.");
                  }}
                  type="button"
                >
                  Approve
                </button>
              </div>
              <Input
                label="Reject reason"
                onChange={(event) => setRejectReason(event.target.value)}
                value={rejectReason}
              />
              <button
                className="admin-action w-full justify-center text-coral"
                onClick={() => {
                  const nextOrder = rejectReturn(selectedOrder, adminId, rejectReason);
                  replaceOrder(nextOrder, "order.return_reject", { reason: rejectReason });
                  setToast("Return rejected.");
                }}
                type="button"
              >
                Reject return
              </button>
              <Select label="QC decision" onChange={(event) => setQcDecision(event.target.value as ReturnQcDecision)} value={qcDecision}>
                <option value="restock">Restock</option>
                <option value="damaged">Damaged</option>
                <option value="quarantine">Quarantine</option>
              </Select>
              <button
                className="admin-action w-full justify-center"
                onClick={() =>
                  runInventoryOperation(
                    () =>
                      completeReturnQc({
                        adminId,
                        batches,
                        decision: qcDecision,
                        movements,
                        order: selectedOrder
                      }),
                    "Return QC completed and inventory updated.",
                    "order.return_qc"
                  )
                }
                type="button"
              >
                <RefreshCcw className="h-4 w-4" /> Complete QC
              </button>
              <button
                className="admin-action w-full justify-center"
                onClick={() => {
                  const nextOrder = markRefunded(selectedOrder, adminId);
                  replaceOrder(nextOrder, "order.refund");
                  setToast("Refund placeholder processed.");
                }}
                type="button"
              >
                Process refund
              </button>
              <Input
                label="Cancellation reason"
                onChange={(event) => setCancelReason(event.target.value)}
                value={cancelReason}
              />
              <button
                className="admin-action w-full justify-center text-coral"
                onClick={() =>
                  runInventoryOperation(
                    () =>
                      cancelOrder({
                        adminId,
                        batches,
                        movements,
                        order: selectedOrder,
                        reason: cancelReason
                      }),
                    "Cancellation handled.",
                    "order.cancel"
                  )
                }
                type="button"
              >
                <Ban className="h-4 w-4" /> Cancel order
              </button>
            </div>
          </AdminCard>

          <AdminCard title="Customer communication log">
            <div className="space-y-3">
              {selectedOrder.communicationLog.length ? (
                selectedOrder.communicationLog.map((entry) => (
                  <div className="rounded-md border border-black/10 p-3 text-sm" key={entry.id}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-black text-ink">{label(entry.channel)}</p>
                      <Badge tone={entry.status === "failed" ? "sale" : "neutral"}>{label(entry.status)}</Badge>
                    </div>
                    <p className="mt-2 text-graphite">{entry.message}</p>
                  </div>
                ))
              ) : (
                <p className="rounded-md bg-mist p-3 text-sm text-slate">No customer communication logs yet.</p>
              )}
            </div>
          </AdminCard>
        </div>
      </div>

      <AdminCard title="Reports">
        <div className="grid gap-4 lg:grid-cols-4">
          <ReportCard title="Orders by status" lines={statusSummary(orders)} />
          <ReportCard title="Refund report" lines={[`Processed: Rs ${metrics.refunds.toLocaleString("en-IN")}`, "Pending exports: placeholder"]} />
          <ReportCard title="Return reasons" lines={adminOrderReports.returnReasons.map((entry) => `${entry.reason}: ${entry.count}`)} />
          <ReportCard title="Courier performance" lines={adminOrderReports.courierPerformance.map((entry) => `${entry.carrier}: ${entry.delivered}% delivered, RTO ${entry.rto}%`)} />
        </div>
        <p className="mt-4 text-xs font-semibold text-slate">
          Inventory connection: {batches.length} batches loaded, {movements.length} stock movement records in the current admin session.
        </p>
      </AdminCard>
    </div>
  );
}

function Metric({ label: title, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-card border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate">{title}</p>
      <p className="mt-2 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}

function InfoBlock({ helper, label: title, value }: { helper?: string; label: string; value: string }) {
  return (
    <div className="rounded-md bg-mist p-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate">{title}</p>
      <p className="mt-1 font-black text-ink">{value}</p>
      {helper ? <p className="mt-1 text-xs text-slate">{helper}</p> : null}
    </div>
  );
}

function AddressBlock({ address, label: title }: { address: AdminOrder["shippingAddress"]; label: string }) {
  return (
    <div className="rounded-md border border-black/10 p-3 text-sm">
      <p className="font-black text-ink">{title}</p>
      <p className="mt-2 text-graphite">
        {address.firstName} {address.lastName}, {address.line1}
        {address.line2 ? `, ${address.line2}` : ""}, {address.city}, {address.state} {address.postalCode}
      </p>
      <p className="mt-1 text-slate">{address.phone}</p>
    </div>
  );
}

function Row({ label: title, strong, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-2 last:border-b-0">
      <span className="text-slate">{title}</span>
      <span className={strong ? "font-black text-ink" : "font-semibold text-graphite"}>{value}</span>
    </div>
  );
}

function ReportCard({ lines, title }: { lines: string[]; title: string }) {
  return (
    <div className="rounded-md border border-black/10 p-4">
      <p className="font-black text-ink">{title}</p>
      <div className="mt-3 space-y-2">
        {lines.map((line) => (
          <p className="text-sm text-graphite" key={line}>
            {line}
          </p>
        ))}
      </div>
    </div>
  );
}

function statusSummary(orders: AdminOrder[]) {
  const counts = orders.reduce<Record<string, number>>((summary, order) => {
    summary[order.status] = (summary[order.status] ?? 0) + 1;
    return summary;
  }, {});

  return Object.entries(counts).map(([status, count]) => `${label(status)}: ${count}`);
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}
