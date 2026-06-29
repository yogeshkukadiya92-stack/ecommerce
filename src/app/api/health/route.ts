import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({
    ok: true,
    service: "FitSupplement Store",
    phase: "14",
    status: "launch-readiness-tested"
  });
}
