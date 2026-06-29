import { z } from "zod";
import type { AdminOrder, AdminShipmentSnapshot, AdminShipmentStatus } from "@/types/orderOps";
import type { ShippingProvider } from "@/types/models";

export type ShippingCarrier = ShippingProvider | "bluedart";

export type ShipmentQuoteInput = {
  provider: ShippingProvider;
  warehousePostalCode: string;
  destinationPostalCode: string;
  weightInGrams: number;
};

export type ServiceabilityInput = {
  carrier: ShippingCarrier;
  pincode: string;
  warehousePincode?: string;
  weightInGrams?: number;
};

export type ShiprocketConfig = {
  apiBase: string;
  email: string;
  password: string;
  pickupLocation: string;
  defaultWeightKg: number;
  channelId?: string;
};

export type ShiprocketServiceabilityInput = {
  cod?: boolean;
  deliveryPostcode: string;
  pickupPostcode: string;
  weightKg: number;
};

export type ShiprocketShipmentInput = {
  order: AdminOrder;
  pickupLocation?: string;
  pickupPostcode?: string;
  weightKg?: number;
};

export type ShiprocketTrackingEvent = {
  at?: string;
  location?: string;
  message: string;
  status: AdminShipmentStatus | "unknown";
};

export type ShiprocketTrackingResult = {
  events: ShiprocketTrackingEvent[];
  rawStatus?: string;
  status: AdminShipmentStatus;
  trackingNumber: string;
};

type JsonRecord = Record<string, unknown>;

const pincodeSchema = z.string().regex(/^[1-9][0-9]{5}$/, "Enter a valid 6 digit Indian pincode.");

export function getShippingConfig() {
  return {
    delhiveryTokenConfigured: Boolean(process.env.DELHIVERY_API_TOKEN),
    shiprocketConfigured: isShiprocketConfigured()
  };
}

export function getShiprocketConfig(): ShiprocketConfig {
  const email = process.env.SHIPROCKET_EMAIL ?? "";
  const password = process.env.SHIPROCKET_PASSWORD ?? "";
  const pickupLocation = process.env.SHIPROCKET_PICKUP_LOCATION ?? "";
  const defaultWeightKg = Number(process.env.SHIPROCKET_DEFAULT_WEIGHT_KG ?? "0.5");

  if (!email || !password || !pickupLocation) {
    throw new Error("Shiprocket is not configured. Add SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD, and SHIPROCKET_PICKUP_LOCATION.");
  }

  return {
    apiBase: (process.env.SHIPROCKET_API_BASE ?? "https://apiv2.shiprocket.in/v1/external").replace(/\/$/, ""),
    channelId: process.env.SHIPROCKET_CHANNEL_ID,
    defaultWeightKg: Number.isFinite(defaultWeightKg) && defaultWeightKg > 0 ? defaultWeightKg : 0.5,
    email,
    password,
    pickupLocation
  };
}

export function isShiprocketConfigured() {
  return Boolean(process.env.SHIPROCKET_EMAIL && process.env.SHIPROCKET_PASSWORD && process.env.SHIPROCKET_PICKUP_LOCATION);
}

export async function getShipmentQuote(input: ShipmentQuoteInput) {
  if (input.provider === "shiprocket" && isShiprocketConfigured()) {
    const serviceability = await checkShiprocketServiceability({
      deliveryPostcode: input.destinationPostalCode,
      pickupPostcode: input.warehousePostalCode,
      weightKg: gramsToKg(input.weightInGrams)
    });

    return {
      provider: input.provider,
      serviceLevel: serviceability.courierName ?? "standard",
      estimatedCharge: serviceability.rateEstimate ?? estimateFallbackShippingRate(input.weightInGrams),
      estimatedDays: serviceability.estimatedDays ?? "3-5",
      message: serviceability.message
    };
  }

  return {
    provider: input.provider,
    serviceLevel: "standard",
    estimatedCharge: estimateFallbackShippingRate(input.weightInGrams),
    estimatedDays: "3-5",
    message: `${input.provider} rate estimate placeholder.`
  };
}

export function checkPincodeServiceability(input: ServiceabilityInput) {
  const isServiceable = pincodeSchema.safeParse(input.pincode).success;

  return {
    carrier: input.carrier,
    estimatedDays: isServiceable ? "2-5" : undefined,
    isCodAvailable: isServiceable && input.carrier !== "bluedart",
    isServiceable,
    message: isServiceable
      ? `${input.carrier} can service ${input.pincode}.`
      : "Pincode serviceability could not confirm this location.",
    pincode: input.pincode,
    rateEstimate: isServiceable ? estimateFallbackShippingRate(input.weightInGrams ?? 500) : undefined
  };
}

export async function checkShiprocketServiceability(input: ShiprocketServiceabilityInput) {
  pincodeSchema.parse(input.pickupPostcode);
  pincodeSchema.parse(input.deliveryPostcode);

  const config = getShiprocketConfig();
  const token = await getShiprocketToken(config);
  const query = new URLSearchParams({
    cod: input.cod ? "1" : "0",
    delivery_postcode: input.deliveryPostcode,
    pickup_postcode: input.pickupPostcode,
    weight: input.weightKg.toFixed(2)
  });
  const response = await shiprocketFetch(`/courier/serviceability/?${query.toString()}`, {
    config,
    method: "GET",
    token
  });

  const courier = firstCourier(response);

  return {
    courierName: stringFrom(courier?.courier_name),
    estimatedDays: stringFrom(courier?.etd) ?? stringFrom(courier?.estimated_delivery_days),
    isCodAvailable: Boolean(courier?.cod),
    isServiceable: Boolean(courier) || Boolean((response as JsonRecord).status),
    message: stringFrom((response as JsonRecord).message) ?? "Shiprocket serviceability checked.",
    rateEstimate: numberFrom(courier?.rate ?? courier?.freight_charge)
  };
}

export async function createShiprocketShipment(input: ShiprocketShipmentInput): Promise<AdminShipmentSnapshot> {
  const config = getShiprocketConfig();
  const token = await getShiprocketToken(config);
  const payload = buildShiprocketAdhocOrderPayload({
    order: input.order,
    pickupLocation: input.pickupLocation ?? config.pickupLocation,
    weightKg: input.weightKg ?? config.defaultWeightKg
  });

  const createdOrder = await shiprocketFetch("/orders/create/adhoc", {
    body: payload,
    config,
    method: "POST",
    token
  });

  const shipmentId = stringFrom((createdOrder as JsonRecord).shipment_id) ?? stringFrom((createdOrder as JsonRecord).shipmentId);
  const providerOrderId = stringFrom((createdOrder as JsonRecord).order_id) ?? stringFrom((createdOrder as JsonRecord).orderId);
  let awbCode = stringFrom((createdOrder as JsonRecord).awb_code);
  let courierName = stringFrom((createdOrder as JsonRecord).courier_name);
  let labelUrl = stringFrom((createdOrder as JsonRecord).label_url);

  if (shipmentId) {
    const awbResponse = await tryShiprocketFetch("/courier/assign/awb", {
      body: { shipment_id: shipmentId },
      config,
      method: "POST",
      token
    });
    const awbData = nestedRecord(awbResponse, "response", "data") ?? nestedRecord(awbResponse, "data") ?? awbResponse;
    awbCode = stringFrom(awbData?.awb_code) ?? stringFrom(awbData?.awb) ?? awbCode;
    courierName = stringFrom(awbData?.courier_name) ?? courierName;

    const labelResponse = await tryShiprocketFetch("/courier/generate/label", {
      body: { shipment_id: [Number(shipmentId)] },
      config,
      method: "POST",
      token
    });
    labelUrl = stringFrom((labelResponse as JsonRecord | undefined)?.label_url) ?? stringFrom((labelResponse as JsonRecord | undefined)?.labelUrl) ?? labelUrl;
  }

  return {
    awbCode,
    carrier: "shiprocket",
    courierName,
    estimatedDelivery: "3-5 business days",
    labelUrl: labelUrl ?? `/api/admin/orders/${input.order.orderNumber}/packing-slip`,
    providerOrderId,
    serviceabilityMessage: stringFrom((createdOrder as JsonRecord).message) ?? "Shiprocket shipment created.",
    shipmentId,
    status: awbCode || shipmentId ? "label_created" : "pending",
    trackingNumber: awbCode ?? shipmentId
  };
}

export async function fetchShiprocketTracking(trackingNumber: string): Promise<ShiprocketTrackingResult> {
  if (!trackingNumber.trim()) {
    throw new Error("Tracking number or AWB is required.");
  }

  const config = getShiprocketConfig();
  const token = await getShiprocketToken(config);
  const response = await shiprocketFetch(`/courier/track/awb/${encodeURIComponent(trackingNumber.trim())}`, {
    config,
    method: "GET",
    token
  });
  const shipmentTrack = firstArrayItem(nestedArray(response, "tracking_data", "shipment_track")) ?? nestedRecord(response, "tracking_data") ?? (response as JsonRecord);
  const rawStatus = stringFrom(shipmentTrack?.current_status) ?? stringFrom(shipmentTrack?.status);
  const activities = nestedArray(response, "tracking_data", "shipment_track_activities") ?? nestedArray(shipmentTrack, "activities") ?? [];

  return {
    events: activities.length
      ? activities.map((activity) => ({
          at: stringFrom(activity.date) ?? stringFrom(activity.activity_date),
          location: stringFrom(activity.location),
          message: stringFrom(activity.activity) ?? stringFrom(activity.message) ?? "Shipment tracking event.",
          status: mapShiprocketStatus(stringFrom(activity.status) ?? rawStatus)
        }))
      : [
          {
            message: rawStatus ? `Current Shiprocket status: ${rawStatus}` : "Shiprocket tracking fetched.",
            status: mapShiprocketStatus(rawStatus)
          }
        ],
    rawStatus,
    status: mapShiprocketStatus(rawStatus),
    trackingNumber
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
    awbCode: input.trackingNumber,
    carrier: input.carrier,
    courierName: input.carrier === "manual" ? "Manual courier" : undefined,
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

export function buildShiprocketAdhocOrderPayload(input: {
  order: AdminOrder;
  pickupLocation: string;
  weightKg: number;
}) {
  const order = input.order;
  const address = order.shippingAddress;

  return {
    billing_address: address.line1,
    billing_address_2: address.line2 ?? "",
    billing_alternate_phone: "",
    billing_city: address.city,
    billing_country: address.country || "India",
    billing_customer_name: `${address.firstName} ${address.lastName}`.trim() || order.customerName,
    billing_email: order.customerEmail,
    billing_last_name: "",
    billing_phone: order.customerPhone || address.phone,
    billing_pincode: address.postalCode,
    billing_state: address.state,
    breadth: 10,
    channel_id: process.env.SHIPROCKET_CHANNEL_ID ? Number(process.env.SHIPROCKET_CHANNEL_ID) : undefined,
    height: 10,
    length: 10,
    order_date: order.placedAt.slice(0, 10),
    order_id: order.orderNumber,
    order_items: order.items.map((item) => ({
      discount: 0,
      hsn: item.hsnCode,
      name: item.productName,
      selling_price: item.unitPrice,
      sku: item.sku,
      tax: item.gstRate,
      units: item.quantity
    })),
    payment_method: order.payment.method === "cod" ? "COD" : "Prepaid",
    pickup_location: input.pickupLocation,
    shipping_charges: order.shippingAmount,
    shipping_is_billing: true,
    sub_total: order.subtotal,
    total_discount: order.discountAmount,
    weight: input.weightKg
  };
}

export function mapShiprocketStatus(status?: string): AdminShipmentStatus {
  const normalized = (status ?? "").toLowerCase();

  if (normalized.includes("ndr") || normalized.includes("undelivered")) return "ndr";
  if (normalized.includes("rto")) return "rto";
  if (normalized.includes("out for delivery") || normalized.includes("ofd")) return "out_for_delivery";
  if (normalized.includes("delivered")) return "delivered";
  if (normalized.includes("pickup") || normalized.includes("picked")) return "picked_up";
  if (normalized.includes("transit") || normalized.includes("shipped") || normalized.includes("manifest")) return "in_transit";
  if (normalized.includes("awb") || normalized.includes("label")) return "label_created";

  return "in_transit";
}

export function estimateFallbackShippingRate(weightInGrams: number) {
  const chargeableUnits = Math.max(1, Math.ceil(weightInGrams / 500));
  return 49 + (chargeableUnits - 1) * 25;
}

async function getShiprocketToken(config: ShiprocketConfig) {
  const response = await shiprocketFetch("/auth/login", {
    body: {
      email: config.email,
      password: config.password
    },
    config,
    method: "POST"
  });
  const token = stringFrom((response as JsonRecord).token);

  if (!token) {
    throw new Error("Shiprocket login did not return an auth token.");
  }

  return token;
}

async function shiprocketFetch(
  path: string,
  input: {
    body?: unknown;
    config: ShiprocketConfig;
    method: "GET" | "POST";
    token?: string;
  }
) {
  const response = await fetch(`${input.config.apiBase}${path}`, {
    body: input.body ? JSON.stringify(removeUndefined(input.body)) : undefined,
    headers: {
      Accept: "application/json",
      ...(input.body ? { "Content-Type": "application/json" } : {}),
      ...(input.token ? { Authorization: `Bearer ${input.token}` } : {})
    },
    method: input.method
  });
  const data = (await response.json().catch(() => ({}))) as unknown;

  if (!response.ok) {
    throw new Error(extractShiprocketError(data) ?? `Shiprocket request failed with status ${response.status}.`);
  }

  return data;
}

async function tryShiprocketFetch(...args: Parameters<typeof shiprocketFetch>) {
  try {
    return (await shiprocketFetch(...args)) as JsonRecord;
  } catch {
    return undefined;
  }
}

function gramsToKg(weightInGrams: number) {
  return Math.max(0.1, weightInGrams / 1000);
}

function firstCourier(response: unknown) {
  const couriers =
    nestedArray(response, "data", "available_courier_companies") ??
    nestedArray(response, "available_courier_companies") ??
    nestedArray(response, "data", "recommended_courier_company_id");

  return firstArrayItem(couriers);
}

function firstArrayItem(value: unknown[] | undefined) {
  return value?.find((item): item is JsonRecord => Boolean(item) && typeof item === "object" && !Array.isArray(item));
}

function nestedArray(value: unknown, ...path: string[]) {
  const item = nestedRecord(value, ...path);
  return Array.isArray(item) ? (item as JsonRecord[]) : undefined;
}

function nestedRecord(value: unknown, ...path: string[]) {
  let current: unknown = value;
  for (const key of path) {
    if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
    current = (current as JsonRecord)[key];
  }
  return current && typeof current === "object" && !Array.isArray(current) ? (current as JsonRecord) : undefined;
}

function stringFrom(value: unknown) {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  return undefined;
}

function numberFrom(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return undefined;
}

function extractShiprocketError(value: unknown) {
  if (!value || typeof value !== "object") return undefined;
  const record = value as JsonRecord;
  return stringFrom(record.message) ?? stringFrom(record.error) ?? stringFrom(record.errors);
}

function removeUndefined<T>(value: T): T {
  if (Array.isArray(value)) {
    return value.map(removeUndefined) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as JsonRecord)
        .filter(([, entry]) => entry !== undefined)
        .map(([key, entry]) => [key, removeUndefined(entry)])
    ) as T;
  }

  return value;
}
