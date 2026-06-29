import { NextResponse } from "next/server";
import { z } from "zod";
import { checkPincodeServiceability, checkShiprocketServiceability, isShiprocketConfigured } from "@/lib/services/shipping";

const requestSchema = z.object({
  cod: z.boolean().optional(),
  deliveryPostcode: z.string().min(6),
  pickupPostcode: z.string().min(6),
  weightKg: z.number().positive().optional()
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());

    if (!isShiprocketConfigured()) {
      const fallback = checkPincodeServiceability({
        carrier: "shiprocket",
        pincode: body.deliveryPostcode,
        warehousePincode: body.pickupPostcode,
        weightInGrams: Math.round((body.weightKg ?? 0.5) * 1000)
      });

      return NextResponse.json({
        ...fallback,
        configured: false,
        message: `${fallback.message} Add Shiprocket credentials to enable live courier checks.`
      });
    }

    const serviceability = await checkShiprocketServiceability({
      cod: body.cod,
      deliveryPostcode: body.deliveryPostcode,
      pickupPostcode: body.pickupPostcode,
      weightKg: body.weightKg ?? 0.5
    });

    return NextResponse.json({
      ...serviceability,
      configured: true
    });
  } catch (error) {
    const message =
      error instanceof z.ZodError
        ? "Invalid Shiprocket serviceability request."
        : error instanceof Error
          ? error.message
          : "Unable to check pincode serviceability.";

    return NextResponse.json(
      {
        error: "shiprocket_serviceability_failed",
        message
      },
      { status: 400 }
    );
  }
}
