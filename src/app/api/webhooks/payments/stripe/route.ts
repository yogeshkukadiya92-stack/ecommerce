import { NextResponse } from "next/server";

export async function POST() {
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      {
        error: "stripe_webhook_not_configured",
        message: "Stripe webhook handling is disabled until STRIPE_WEBHOOK_SECRET and event persistence are configured.",
        received: false
      },
      { status: 501 }
    );
  }

  return NextResponse.json(
    {
      error: "stripe_webhook_not_implemented",
      message: "Stripe webhook verification must be implemented before enabling Stripe in production.",
      received: false
    },
    { status: 501 }
  );
}
