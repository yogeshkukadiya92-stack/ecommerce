import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createRazorpayOrder,
  getRazorpayConfig,
  razorpayCreateOrderInputSchema
} from "@/lib/services/razorpay";

const initiateRequestSchema = razorpayCreateOrderInputSchema.extend({
  customer: z.object({
    email: z.string().email().optional(),
    name: z.string().optional(),
    phone: z.string().optional()
  }).optional()
});

export async function POST(request: Request) {
  try {
    const body = initiateRequestSchema.parse(await request.json());
    const order = await createRazorpayOrder(body);
    const { keyId } = getRazorpayConfig();

    return NextResponse.json({
      amount: order.amount,
      currency: order.currency,
      keyId,
      razorpayOrderId: order.id,
      receipt: order.receipt,
      status: order.status
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Invalid payment initialization request."
        : error instanceof Error
          ? error.message
          : "Unable to initialize payment.";

    return NextResponse.json(
      {
        error: "razorpay_initialization_failed",
        message
      },
      { status: 400 }
    );
  }
}
