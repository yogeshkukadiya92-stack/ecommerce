import { createShipmentPlaceholder } from "@/lib/services/shipping";
import { reserveStockByFefo } from "@/lib/inventory/fefo";
import type { AdvancedStockMovement, FefoAllocation, InventoryBatchRecord } from "@/types/inventory";
import type {
  AdminOrder,
  AdminOrderStatus,
  AdminShipmentSnapshot,
  AdminShipmentStatus,
  ReturnQcDecision
} from "@/types/orderOps";

type StockOperationResult = {
  batches: InventoryBatchRecord[];
  movements: AdvancedStockMovement[];
  order: AdminOrder;
};

export function appendOrderTimeline(
  order: AdminOrder,
  input: {
    actor: string;
    note?: string;
    status: AdminOrder["timeline"][number]["status"];
    title: string;
  }
): AdminOrder {
  return {
    ...order,
    timeline: [
      {
        actor: input.actor,
        at: new Date().toISOString(),
        id: `tl-${order.orderNumber}-${Date.now()}`,
        note: input.note,
        status: input.status,
        title: input.title
      },
      ...order.timeline
    ]
  };
}

export function updateOrderStatus(
  order: AdminOrder,
  status: AdminOrderStatus,
  adminId: string,
  note?: string
): AdminOrder {
  return appendOrderTimeline(
    {
      ...order,
      status
    },
    {
      actor: adminId,
      note,
      status,
      title: orderStatusTitle(status)
    }
  );
}

export function reserveOrderStock(input: {
  adminId: string;
  batches: InventoryBatchRecord[];
  minimumShelfLifeDays: number;
  movements: AdvancedStockMovement[];
  order: AdminOrder;
  warehouseId?: string;
}): StockOperationResult {
  let workingBatches = [...input.batches];
  let workingMovements = [...input.movements];
  let workingOrder = input.order;
  const reservationNotes: string[] = [];

  for (const item of input.order.items) {
    const reservation = reserveStockByFefo({
      batches: workingBatches,
      quantity: item.quantity,
      rule: {
        minimumShelfLifeDays: input.minimumShelfLifeDays
      },
      variantId: item.variantId,
      warehouseId: input.warehouseId
    });

    if (reservation.unfulfilledQuantity > 0) {
      const reasons = reservation.rejectedBatches.map((batch) => `${batch.batchNumber}: ${batch.reason}`).join("; ");
      throw new Error(`Unable to reserve ${item.sku}. ${reasons || "Insufficient sellable stock."}`);
    }

    for (const allocation of reservation.allocations) {
      const batch = workingBatches.find((entry) => entry.id === allocation.batchId);

      if (!batch) continue;

      workingBatches = workingBatches.map((entry) =>
        entry.id === allocation.batchId
          ? {
              ...entry,
              availableQuantity: entry.availableQuantity - allocation.quantity,
              reservedQuantity: entry.reservedQuantity + allocation.quantity
            }
          : entry
      );

      workingMovements = [
        {
          adminId: input.adminId,
          adminNote: `Order ${input.order.orderNumber} reserved by FEFO.`,
          at: new Date().toISOString(),
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          id: `mov-order-${Date.now()}-${batch.id}`,
          productName: batch.productName,
          quantity: allocation.quantity,
          reason: `order ${input.order.orderNumber} reservation`,
          sku: batch.sku,
          type: "sale_reserved",
          warehouseName: batch.warehouseName
        },
        ...workingMovements
      ];

      reservationNotes.push(`${item.sku} -> ${allocation.batchNumber} (${allocation.quantity})`);
    }

    workingOrder = {
      ...workingOrder,
      items: workingOrder.items.map((entry) =>
        entry.id === item.id
          ? {
              ...entry,
              batchAllocations: reservation.allocations,
              batchId: reservation.allocations[0]?.batchId,
              batchNumber: reservation.allocations.map((allocation) => allocation.batchNumber).join(", ")
            }
          : entry
      )
    };
  }

  workingOrder = appendOrderTimeline(
    {
      ...workingOrder,
      status: workingOrder.status === "pending" ? "confirmed" : workingOrder.status
    },
    {
      actor: input.adminId,
      note: `Reserved sellable stock. ${reservationNotes.join(", ")}`,
      status: "inventory",
      title: "FEFO stock reserved"
    }
  );

  return {
    batches: workingBatches,
    movements: workingMovements,
    order: workingOrder
  };
}

export function markOrderPacked(order: AdminOrder, adminId: string) {
  return updateOrderStatus(order, "packed", adminId, "Invoice and packing slip placeholders are ready.");
}

export function assignCourier(input: {
  adminId: string;
  carrier: AdminShipmentSnapshot["carrier"];
  order: AdminOrder;
  shipment?: Partial<AdminShipmentSnapshot>;
  trackingNumber?: string;
}) {
  const shipment = createShipmentPlaceholder({
    carrier: input.carrier,
    orderNumber: input.order.orderNumber,
    pincode: input.order.shippingAddress.postalCode,
    trackingNumber: input.trackingNumber
  });

  const shipmentSnapshot: AdminShipmentSnapshot = {
    awbCode: input.shipment?.awbCode ?? shipment.awbCode,
    carrier: input.carrier,
    courierName: input.shipment?.courierName ?? shipment.courierName,
    estimatedDelivery: input.shipment?.estimatedDelivery ?? shipment.estimatedDelivery,
    labelUrl: input.shipment?.labelUrl ?? shipment.labelUrl,
    ndrReason: input.shipment?.ndrReason,
    providerOrderId: input.shipment?.providerOrderId,
    rateEstimate: input.shipment?.rateEstimate,
    serviceabilityMessage: input.shipment?.serviceabilityMessage ?? shipment.message,
    shipmentId: input.shipment?.shipmentId ?? shipment.shipmentId,
    status: input.shipment?.status ?? "label_created",
    trackingNumber: input.shipment?.trackingNumber ?? shipment.trackingNumber
  };

  return appendOrderTimeline(
    {
      ...input.order,
      shipment: shipmentSnapshot
    },
    {
      actor: input.adminId,
      note: `${input.carrier} label created${shipmentSnapshot.trackingNumber ? ` with tracking ${shipmentSnapshot.trackingNumber}` : ""}.`,
      status: shipmentSnapshot.status,
      title: "Courier assigned"
    }
  );
}

export function markOrderShipped(input: {
  adminId: string;
  batches: InventoryBatchRecord[];
  movements: AdvancedStockMovement[];
  order: AdminOrder;
}): StockOperationResult {
  let workingBatches = [...input.batches];
  let workingMovements = [...input.movements];

  for (const item of input.order.items) {
    for (const allocation of allocationsForItem(item)) {
      const batch = workingBatches.find((entry) => entry.id === allocation.batchId);
      if (!batch) continue;

      workingBatches = workingBatches.map((entry) =>
        entry.id === allocation.batchId
          ? {
              ...entry,
              reservedQuantity: Math.max(0, entry.reservedQuantity - allocation.quantity)
            }
          : entry
      );

      workingMovements = [
        {
          adminId: input.adminId,
          adminNote: `Order ${input.order.orderNumber} shipped.`,
          at: new Date().toISOString(),
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          id: `mov-ship-${Date.now()}-${batch.id}`,
          productName: batch.productName,
          quantity: allocation.quantity,
          reason: `order ${input.order.orderNumber} shipped`,
          sku: batch.sku,
          type: "sale_shipped",
          warehouseName: batch.warehouseName
        },
        ...workingMovements
      ];
    }
  }

  const order = appendOrderTimeline(
    {
      ...input.order,
      shipment: {
        ...input.order.shipment,
        status: "in_transit"
      },
      status: "shipped"
    },
    {
      actor: input.adminId,
      note: input.order.shipment.trackingNumber
        ? `Tracking ${input.order.shipment.trackingNumber} is now live.`
        : "Shipment moved to in transit.",
      status: "shipped",
      title: "Order shipped"
    }
  );

  return {
    batches: workingBatches,
    movements: workingMovements,
    order
  };
}

export function cancelOrder(input: {
  adminId: string;
  batches: InventoryBatchRecord[];
  movements: AdvancedStockMovement[];
  order: AdminOrder;
  reason: string;
}): StockOperationResult {
  if (["shipped", "out_for_delivery", "delivered", "return_requested", "returned"].includes(input.order.status)) {
    return {
      batches: input.batches,
      movements: input.movements,
      order: appendOrderTimeline(
        {
          ...input.order,
          return: {
            ...input.order.return,
            reason: input.reason,
            requestedAt: new Date().toISOString(),
            status: "requested"
          },
          status: "return_requested"
        },
        {
          actor: input.adminId,
          note: "Order is already shipped, so cancellation was redirected to return flow.",
          status: "return_requested",
          title: "Cancellation converted to return"
        }
      )
    };
  }

  let workingBatches = [...input.batches];
  let workingMovements = [...input.movements];

  for (const item of input.order.items) {
    for (const allocation of allocationsForItem(item)) {
      const batch = workingBatches.find((entry) => entry.id === allocation.batchId);
      if (!batch) continue;

      workingBatches = workingBatches.map((entry) =>
        entry.id === allocation.batchId
          ? {
              ...entry,
              availableQuantity: entry.availableQuantity + allocation.quantity,
              reservedQuantity: Math.max(0, entry.reservedQuantity - allocation.quantity)
            }
          : entry
      );

      workingMovements = [
        {
          adminId: input.adminId,
          adminNote: input.reason,
          at: new Date().toISOString(),
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          id: `mov-cancel-${Date.now()}-${batch.id}`,
          productName: batch.productName,
          quantity: allocation.quantity,
          reason: `order ${input.order.orderNumber} cancellation restored reserved stock`,
          sku: batch.sku,
          type: "manual_correction",
          warehouseName: batch.warehouseName
        },
        ...workingMovements
      ];
    }
  }

  return {
    batches: workingBatches,
    movements: workingMovements,
    order: updateOrderStatus(input.order, "cancelled", input.adminId, input.reason)
  };
}

export function updateShipmentStatus(
  order: AdminOrder,
  shipmentStatus: AdminShipmentStatus,
  adminId: string,
  note?: string
) {
  const orderStatusByShipment: Partial<Record<AdminShipmentStatus, AdminOrderStatus>> = {
    delivered: "delivered",
    out_for_delivery: "out_for_delivery",
    rto: "rto"
  };

  return appendOrderTimeline(
    {
      ...order,
      shipment: {
        ...order.shipment,
        status: shipmentStatus
      },
      status: orderStatusByShipment[shipmentStatus] ?? order.status
    },
    {
      actor: adminId,
      note,
      status: shipmentStatus,
      title: shipmentStatus.replaceAll("_", " ")
    }
  );
}

export function requestReturn(order: AdminOrder, adminId: string, reason: string) {
  return appendOrderTimeline(
    {
      ...order,
      return: {
        ...order.return,
        reason,
        requestedAt: new Date().toISOString(),
        status: "requested"
      },
      status: "return_requested"
    },
    {
      actor: adminId,
      note: reason,
      status: "return_requested",
      title: "Return requested"
    }
  );
}

export function approveReturn(order: AdminOrder, adminId: string) {
  return appendOrderTimeline(
    {
      ...order,
      return: {
        ...order.return,
        approvedAt: new Date().toISOString(),
        pickupReference: `RPU-${order.orderNumber}`,
        status: "approved"
      }
    },
    {
      actor: adminId,
      note: "Return pickup placeholder created.",
      status: "approved",
      title: "Return approved"
    }
  );
}

export function rejectReturn(order: AdminOrder, adminId: string, reason: string) {
  return appendOrderTimeline(
    {
      ...order,
      return: {
        ...order.return,
        reason,
        status: "rejected"
      }
    },
    {
      actor: adminId,
      note: reason,
      status: "rejected",
      title: "Return rejected"
    }
  );
}

export function completeReturnQc(input: {
  adminId: string;
  batches: InventoryBatchRecord[];
  decision: ReturnQcDecision;
  movements: AdvancedStockMovement[];
  order: AdminOrder;
}): StockOperationResult {
  let workingBatches = [...input.batches];
  let workingMovements = [...input.movements];

  for (const item of input.order.items) {
    for (const allocation of allocationsForItem(item)) {
      const batch = workingBatches.find((entry) => entry.id === allocation.batchId);
      if (!batch) continue;

      workingBatches = workingBatches.map((entry) => {
        if (entry.id !== allocation.batchId) return entry;

        return {
          ...entry,
          availableQuantity:
            input.decision === "restock" ? entry.availableQuantity + allocation.quantity : entry.availableQuantity,
          damagedQuantity:
            input.decision === "damaged" ? entry.damagedQuantity + allocation.quantity : entry.damagedQuantity
        };
      });

      workingMovements = [
        {
          adminId: input.adminId,
          adminNote: `Return QC decision: ${input.decision}.`,
          at: new Date().toISOString(),
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          id: `mov-return-${Date.now()}-${batch.id}`,
          productName: batch.productName,
          quantity: allocation.quantity,
          reason: `order ${input.order.orderNumber} return received`,
          sku: batch.sku,
          type: input.decision === "restock" ? "return_received" : input.decision === "damaged" ? "damaged" : "manual_correction",
          warehouseName: batch.warehouseName
        },
        ...workingMovements
      ];
    }
  }

  const returnStatus = input.decision === "restock" ? "restocked" : input.decision === "damaged" ? "damaged" : "quarantined";
  const order = appendOrderTimeline(
    {
      ...input.order,
      return: {
        ...input.order.return,
        qcDecision: input.decision,
        status: returnStatus
      },
      status: "returned"
    },
    {
      actor: input.adminId,
      note: `Return QC completed as ${input.decision}.`,
      status: returnStatus,
      title: "Return QC completed"
    }
  );

  return {
    batches: workingBatches,
    movements: workingMovements,
    order
  };
}

export function markRefunded(order: AdminOrder, adminId: string) {
  return appendOrderTimeline(
    {
      ...order,
      payment: {
        ...order.payment,
        status: "refunded"
      },
      return: {
        ...order.return,
        refundStatus: "processed",
        status: "refunded"
      },
      status: "refunded"
    },
    {
      actor: adminId,
      note: `Refund placeholder processed via ${order.return.refundMethod ?? "original payment"}.`,
      status: "refunded",
      title: "Refund processed"
    }
  );
}

export function addInternalNote(order: AdminOrder, adminId: string, note: string) {
  if (!note.trim()) {
    throw new Error("Internal note cannot be empty.");
  }

  return {
    ...order,
    internalNotes: [
      {
        adminName: adminId,
        at: new Date().toISOString(),
        id: `note-${Date.now()}`,
        note
      },
      ...order.internalNotes
    ]
  };
}

function orderStatusTitle(status: AdminOrderStatus) {
  const labels: Record<AdminOrderStatus, string> = {
    cancelled: "Order cancelled",
    confirmed: "Order confirmed",
    delivered: "Order delivered",
    out_for_delivery: "Out for delivery",
    packed: "Order packed",
    pending: "Order pending",
    refunded: "Order refunded",
    return_requested: "Return requested",
    returned: "Order returned",
    rto: "Order marked RTO",
    shipped: "Order shipped"
  };

  return labels[status];
}

function allocationsForItem(item: { batchAllocations?: FefoAllocation[]; batchId?: string; batchNumber?: string; quantity: number }) {
  if (item.batchAllocations?.length) {
    return item.batchAllocations;
  }

  if (!item.batchId || !item.batchNumber) {
    return [];
  }

  return [
    {
      batchId: item.batchId,
      batchNumber: item.batchNumber,
      expiryDate: "",
      quantity: item.quantity
    }
  ];
}
