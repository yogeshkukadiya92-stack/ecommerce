import type { ShippingProvider } from "@/types/models";

export type ShipmentQuoteInput = {
  provider: ShippingProvider;
  warehousePostalCode: string;
  destinationPostalCode: string;
  weightInGrams: number;
};

export async function getShipmentQuote(input: ShipmentQuoteInput) {
  return {
    provider: input.provider,
    serviceLevel: "standard",
    estimatedCharge: 0,
    estimatedDays: "3-5",
    message: "Shipping API integration placeholder."
  };
}

export type ShippingCarrier = ShippingProvider | "bluedart";

export type ServiceabilityInput = {
  carrier: ShippingCarrier;
  pincode: string;
  warehousePincode?: string;
  weightInGrams?: number;
};

export function checkPincodeServiceability(input: ServiceabilityInput) {
  const isServiceable = input.pincode.length === 6 && !input.pincode.startsWith("0");

  return {
    carrier: input.carrier,
    estimatedDays: isServiceable ? "2-5" : undefined,
    isCodAvailable: isServiceable && input.carrier !== "bluedart",
    isServiceable,
    message: isServiceable
      ? `${input.carrier} can service ${input.pincode}.`
      : "Pincode serviceability placeholder could not confirm this location.",
    pincode: input.pincode
  };
}

export function createShipmentPlaceholder(input: {
  carrier: ShippingCarrier;
  orderNumber: string;
  pincode: string;
  trackingNumber?: string;
}) {
  const serviceability = checkPincodeServiceability({
    carrier: input.carrier,
    pincode: input.pincode
  });

  return {
    carrier: input.carrier,
    estimatedDelivery: serviceability.isServiceable ? "3-5 business days" : undefined,
    labelUrl: `/api/admin/orders/${input.orderNumber}/packing-slip`,
    message: serviceability.message,
    shipmentId: `ship-${input.orderNumber.toLowerCase()}`,
    status: serviceability.isServiceable ? "label_created" : "pending",
    trackingNumber:
      input.trackingNumber?.trim() ||
      `${input.carrier.toUpperCase().replace("MANUAL", "MNL")}-${input.orderNumber.replace("FS-", "")}`
  };
}

export function fetchTrackingPlaceholder(trackingNumber: string) {
  return {
    events: [
      {
        at: new Date().toISOString(),
        location: "Carrier hub",
        message: "Tracking placeholder fetched successfully.",
        status: "in_transit"
      }
    ],
    status: "in_transit",
    trackingNumber
  };
}

export function fetchNdrRtoPlaceholder(trackingNumber: string) {
  return {
    ndrReason: "Customer unavailable placeholder.",
    rtoRisk: "medium",
    trackingNumber
  };
}
