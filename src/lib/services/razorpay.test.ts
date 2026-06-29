import assert from "node:assert/strict";
import crypto from "node:crypto";
import test from "node:test";
import { createRazorpayPaymentSignature } from "./razorpay";

test("creates Razorpay payment signature from order id and payment id", () => {
  const signature = createRazorpayPaymentSignature({
    orderId: "order_test_123",
    paymentId: "pay_test_456",
    secret: "secret"
  });
  const expected = crypto.createHmac("sha256", "secret").update("order_test_123|pay_test_456").digest("hex");

  assert.equal(signature, expected);
});
