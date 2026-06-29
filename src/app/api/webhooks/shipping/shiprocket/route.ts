import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    received: true,
    message: "Shiprocket webhook placeholder."
  });
}
