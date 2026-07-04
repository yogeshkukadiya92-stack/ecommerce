import type { PaymentProvider } from "@/types/models";
import type { PaymentMethod } from "@/types/checkout";

export type PaymentIntentInput = {
  provider: PaymentProvider;
  orderId: string;
  amount: number;
  currency: string;
  customerEmail: string;
};

export async function createPaymentIntent(input: PaymentIntentInput) {
  if (process.env.NODE_ENV === "production") {
    throw new Error(`${input.provider} payment intent creation is not configured.`);
  }

  return {
    provider: input.provider,
    orderId: input.orderId,
    amount: input.amount,
    currency: input.currency,
    status: "provider_pending",
    message: "Payment provider integration placeholder."
  };
}

export async function processMockCheckoutPayment(input: {
  amount: number;
  method: PaymentMethod;
  orderNumber: string;
}) {
  await new Promise((resolve) => setTimeout(resolve, 500));

  if (input.method === "cod") {
    return {
      message: "COD confirmation placeholder accepted.",
      status: "cod_pending" as const,
      transactionId: `cod_${input.orderNumber.toLowerCase()}`
    };
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Online payments must use a configured payment gateway in production.");
  }

  return {
    message: "Mock payment authorized. Razorpay, Stripe, or Cashfree can replace this service later.",
    status: "paid" as const,
    transactionId: `mock_pay_${Date.now()}`
  };
}
