import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const event = await request.json().catch(() => ({}));

  return NextResponse.json({
    event,
    received: true,
    message: "Shiprocket webhook placeholder received. Persist shipment events and verify webhook secret before production use."
  });
}
