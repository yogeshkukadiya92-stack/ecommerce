import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET?.trim();

  if (!webhookSecret) {
    return NextResponse.json(
      {
        error: "shiprocket_webhook_not_configured",
        message: "Shiprocket webhook handling is disabled until SHIPROCKET_WEBHOOK_SECRET is configured.",
        received: false
      },
      { status: 501 }
    );
  }

  const receivedSecret =
    request.headers.get("x-shiprocket-webhook-secret") ??
    request.headers.get("x-shiprocket-signature") ??
    request.headers.get("x-webhook-secret");

  if (receivedSecret !== webhookSecret) {
    return NextResponse.json(
      {
        error: "shiprocket_webhook_unauthorized",
        received: false
      },
      { status: 401 }
    );
  }

  const event = await request.json().catch(() => ({}));

  return NextResponse.json({
    event,
    received: true,
    message: "Shiprocket webhook received. Persist shipment status updates before enabling automated fulfillment."
  });
}
