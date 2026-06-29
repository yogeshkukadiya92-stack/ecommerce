import { NextResponse } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/services/razorpay";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");

  try {
    const verified = verifyRazorpayWebhookSignature({ body, signature });

    if (!verified) {
      return NextResponse.json(
        {
          error: "razorpay_webhook_signature_mismatch",
          received: false
        },
        { status: 400 }
      );
    }

    const event = JSON.parse(body) as {
      event?: string;
      payload?: unknown;
    };

    return NextResponse.json({
      event: event.event ?? "unknown",
      message: "Razorpay webhook verified. Persist payment/order updates when database writes are enabled.",
      received: true
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "razorpay_webhook_failed",
        message: error instanceof Error ? error.message : "Unable to process Razorpay webhook.",
        received: false
      },
      { status: 400 }
    );
  }
}
