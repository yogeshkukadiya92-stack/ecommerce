import crypto from "node:crypto";
import { z } from "zod";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

export const razorpayCreateOrderInputSchema = z.object({
  amount: z.number().positive(),
  currency: z.literal("INR").default("INR"),
  notes: z.record(z.string()).optional(),
  receipt: z.string().min(1).max(40)
});

export const razorpayVerifyInputSchema = z.object({
  checkoutOrderNumber: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1)
});

export type RazorpayCreateOrderInput = z.infer<typeof razorpayCreateOrderInputSchema>;
export type RazorpayVerifyInput = z.infer<typeof razorpayVerifyInputSchema>;

export type RazorpayOrderResponse = {
  amount: number;
  amount_due: number;
  amount_paid: number;
  attempts: number;
  created_at: number;
  currency: string;
  entity: "order";
  id: string;
  notes?: Record<string, string>;
  receipt: string;
  status: "created" | "attempted" | "paid";
};

export function getRazorpayConfig() {
  return {
    keyId: process.env.RAZORPAY_KEY_ID ?? "",
    keySecret: process.env.RAZORPAY_KEY_SECRET ?? "",
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET ?? ""
  };
}

export function isRazorpayConfigured() {
  const config = getRazorpayConfig();
  return Boolean(config.keyId && config.keySecret);
}

export async function createRazorpayOrder(input: RazorpayCreateOrderInput) {
  const parsed = razorpayCreateOrderInputSchema.parse(input);
  const config = getRazorpayConfig();

  if (!config.keyId || !config.keySecret) {
    throw new Error("Razorpay is not configured. Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.");
  }

  const response = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    body: JSON.stringify({
      amount: toRazorpayAmount(parsed.amount),
      currency: parsed.currency,
      notes: parsed.notes,
      receipt: parsed.receipt
    }),
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64")}`,
      "Content-Type": "application/json"
    },
    method: "POST"
  });

  const data = (await response.json().catch(() => ({}))) as Partial<RazorpayOrderResponse> & {
    error?: { description?: string; reason?: string };
  };

  if (!response.ok) {
    throw new Error(data.error?.description ?? data.error?.reason ?? "Unable to initialize Razorpay order.");
  }

  return data as RazorpayOrderResponse;
}

export function verifyRazorpayPaymentSignature(input: RazorpayVerifyInput) {
  const parsed = razorpayVerifyInputSchema.parse(input);
  const { keySecret } = getRazorpayConfig();

  if (!keySecret) {
    throw new Error("Razorpay signature verification is not configured.");
  }

  const expectedSignature = createRazorpayPaymentSignature({
    orderId: parsed.razorpay_order_id,
    paymentId: parsed.razorpay_payment_id,
    secret: keySecret
  });

  return secureCompare(expectedSignature, parsed.razorpay_signature);
}

export function createRazorpayPaymentSignature(input: {
  orderId: string;
  paymentId: string;
  secret: string;
}) {
  return crypto
    .createHmac("sha256", input.secret)
    .update(`${input.orderId}|${input.paymentId}`)
    .digest("hex");
}

export function verifyRazorpayWebhookSignature(input: {
  body: string;
  signature?: string | null;
}) {
  const { webhookSecret } = getRazorpayConfig();

  if (!webhookSecret) {
    throw new Error("Razorpay webhook secret is not configured.");
  }

  if (!input.signature) {
    return false;
  }

  const expectedSignature = crypto.createHmac("sha256", webhookSecret).update(input.body).digest("hex");
  return secureCompare(expectedSignature, input.signature);
}

function secureCompare(expected: string, received: string) {
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

function toRazorpayAmount(amount: number) {
  return Math.round(amount * 100);
}
