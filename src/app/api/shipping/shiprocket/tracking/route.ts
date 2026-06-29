import { NextResponse } from "next/server";
import { z } from "zod";
import { fetchShiprocketTracking, fetchTrackingPlaceholder, isShiprocketConfigured } from "@/lib/services/shipping";

const requestSchema = z.object({
  trackingNumber: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());

    if (!isShiprocketConfigured()) {
      return NextResponse.json({
        configured: false,
        message: "Shiprocket credentials are not configured. Showing local tracking placeholder.",
        tracking: fetchTrackingPlaceholder(body.trackingNumber)
      });
    }

    const tracking = await fetchShiprocketTracking(body.trackingNumber);

    return NextResponse.json({
      configured: true,
      message: "Shiprocket tracking fetched.",
      tracking
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Invalid tracking request."
        : error instanceof Error
          ? error.message
          : "Unable to fetch Shiprocket tracking.";

    return NextResponse.json(
      {
        error: "shiprocket_tracking_failed",
        message
      },
      { status: 400 }
    );
  }
}
