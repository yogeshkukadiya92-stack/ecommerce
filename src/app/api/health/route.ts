import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

const requiredEnv = ["DATABASE_URL", "AUTH_SECRET", "ADMIN_EMAIL", "ADMIN_PASSWORD"] as const;

export async function GET() {
  const missingEnv = requiredEnv.filter((key) => !process.env[key]);

  try {
    await prisma.$runCommandRaw({ ping: 1 });

    return NextResponse.json({
      checks: {
        database: "ok",
        env: missingEnv.length === 0 ? "ok" : "missing"
      },
      missingEnv,
      ok: missingEnv.length === 0,
      service: "FitSupplement Store",
      status: missingEnv.length === 0 ? "ready" : "configuration_incomplete"
    }, { status: missingEnv.length === 0 ? 200 : 503 });
  } catch {
    return NextResponse.json(
      {
        checks: {
          database: "failed",
          env: missingEnv.length === 0 ? "ok" : "missing"
        },
        missingEnv,
        ok: false,
        service: "FitSupplement Store",
        status: "database_unavailable"
      },
      { status: 503 }
    );
  }
}
