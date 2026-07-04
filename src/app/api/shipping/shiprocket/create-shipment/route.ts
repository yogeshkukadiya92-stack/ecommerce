import { NextResponse } from "next/server";
import { z } from "zod";
import {
  createShipmentPlaceholder,
  createShiprocketShipment,
  isShiprocketConfigured
} from "@/lib/services/shipping";
import type { AdminOrder } from "@/types/orderOps";

const requestSchema = z.object({
  order: z.custom<AdminOrder>((value) => Boolean(value && typeof value === "object")),
  pickupLocation: z.string().optional(),
  pickupPostcode: z.string().optional(),
  weightKg: z.number().positive().optional()
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());

    if (!isShiprocketConfigured()) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json(
          {
            configured: false,
            error: "shiprocket_not_configured",
            message: "Shiprocket credentials are required before creating live shipments."
          },
          { status: 503 }
        );
      }

      const placeholder = createShipmentPlaceholder({
        carrier: "shiprocket",
        orderNumber: body.order.orderNumber,
        pincode: body.order.shippingAddress.postalCode
      });

      return NextResponse.json({
        configured: false,
        message: "Shiprocket credentials are not configured. Local label placeholder generated.",
        shipment: {
          awbCode: placeholder.awbCode,
          carrier: "shiprocket",
          courierName: placeholder.courierName,
          estimatedDelivery: placeholder.estimatedDelivery,
          labelUrl: placeholder.labelUrl,
          serviceabilityMessage: placeholder.message,
          shipmentId: placeholder.shipmentId,
          status: placeholder.status,
          trackingNumber: placeholder.trackingNumber
        }
      });
    }

    const shipment = await createShiprocketShipment({
      order: body.order,
      pickupLocation: body.pickupLocation,
      pickupPostcode: body.pickupPostcode,
      weightKg: body.weightKg
    });

    return NextResponse.json({
      configured: true,
      message: "Shiprocket shipment created.",
      shipment
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Invalid shipment creation request."
        : error instanceof Error
          ? error.message
          : "Unable to create Shiprocket shipment.";

    return NextResponse.json(
      {
        error: "shiprocket_shipment_failed",
        message
      },
      { status: 400 }
    );
  }
}
