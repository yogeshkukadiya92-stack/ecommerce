import assert from "node:assert/strict";
import test from "node:test";
import { adminOrders } from "@/mock/adminOrders";
import {
  buildShiprocketAdhocOrderPayload,
  checkPincodeServiceability,
  estimateFallbackShippingRate,
  mapShiprocketStatus
} from "./shipping";

test("Shiprocket adhoc order payload uses order, address, item, and payment data", () => {
  const payload = buildShiprocketAdhocOrderPayload({
    order: adminOrders[0],
    pickupLocation: "Mumbai Fulfilment Hub",
    weightKg: 1.25
  });

  assert.equal(payload.order_id, "FS-1001");
  assert.equal(payload.pickup_location, "Mumbai Fulfilment Hub");
  assert.equal(payload.payment_method, "Prepaid");
  assert.equal(payload.billing_pincode, adminOrders[0].shippingAddress.postalCode);
  assert.equal(payload.order_items.length, adminOrders[0].items.length);
  assert.equal(payload.order_items[0].sku, adminOrders[0].items[0].sku);
  assert.equal(payload.weight, 1.25);
});

test("shipping fallback serviceability validates Indian pincodes and estimates rates", () => {
  const serviceable = checkPincodeServiceability({
    carrier: "shiprocket",
    pincode: "400001",
    weightInGrams: 1200
  });
  const invalid = checkPincodeServiceability({
    carrier: "shiprocket",
    pincode: "040001",
    weightInGrams: 1200
  });

  assert.equal(serviceable.isServiceable, true);
  assert.equal(serviceable.rateEstimate, 99);
  assert.equal(invalid.isServiceable, false);
  assert.equal(estimateFallbackShippingRate(100), 49);
});

test("Shiprocket status mapper handles fulfillment, NDR, and RTO statuses", () => {
  assert.equal(mapShiprocketStatus("AWB Assigned"), "label_created");
  assert.equal(mapShiprocketStatus("In Transit"), "in_transit");
  assert.equal(mapShiprocketStatus("Out For Delivery"), "out_for_delivery");
  assert.equal(mapShiprocketStatus("Undelivered - NDR Raised"), "ndr");
  assert.equal(mapShiprocketStatus("RTO Initiated"), "rto");
  assert.equal(mapShiprocketStatus("Delivered"), "delivered");
});
