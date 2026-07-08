import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ message: "Image not found." }, { status: 404 });
  }

  const asset = await prisma.mediaAsset.findUnique({ where: { id } });

  if (!asset) {
    return NextResponse.json({ message: "Image not found." }, { status: 404 });
  }

  return new Response(Buffer.from(asset.data), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(asset.size),
      "Content-Type": asset.mimeType
    }
  });
}
