import { NextResponse } from "next/server";
import { z } from "zod";
import { razorpayVerifyInputSchema, verifyRazorpayPaymentSignature } from "@/lib/services/razorpay";

export async function POST(request: Request) {
  try {
    const body = razorpayVerifyInputSchema.parse(await request.json());
    const verified = verifyRazorpayPaymentSignature(body);

    if (!verified) {
      return NextResponse.json(
        {
          error: "razorpay_signature_mismatch",
          message: "Payment could not be verified. If money was deducted, support will reconcile it with Razorpay."
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      checkoutOrderNumber: body.checkoutOrderNumber,
      provider: "razorpay",
      providerOrderId: body.razorpay_order_id,
      providerPaymentId: body.razorpay_payment_id,
      signature: body.razorpay_signature,
      status: "paid",
      verified: true
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Invalid payment verification request."
        : error instanceof Error
          ? error.message
          : "Unable to verify payment.";

    return NextResponse.json(
      {
        error: "razorpay_verification_failed",
        message
      },
      { status: 400 }
    );
  }
}
