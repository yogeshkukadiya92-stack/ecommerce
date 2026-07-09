import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/admin/apiAuth";
import { prisma } from "@/lib/db/prisma";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif"]);

export async function POST(request: Request) {
  const auth = requireAdminPermission(request, "catalog:write");

  if (auth.response) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Select an image file to upload." }, { status: 400 });
    }

    if (!allowedMimeTypes.has(file.type)) {
      return NextResponse.json({ message: "Only JPG, PNG, WEBP, GIF, SVG, or AVIF images are supported." }, { status: 400 });
    }

    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ message: "Image must be 5 MB or smaller." }, { status: 400 });
    }

    const asset = await prisma.mediaAsset.create({
      data: {
        data: Buffer.from(await file.arrayBuffer()),
        filename: file.name || "upload",
        mimeType: file.type,
        size: file.size
      },
      select: {
        id: true
      }
    });

    return NextResponse.json({ message: "Image uploaded.", url: `/api/media/${asset.id}` }, { status: 201 });
  } catch (error) {
    console.error("Media upload failed", error);
    return NextResponse.json({ message: "Unable to upload image right now." }, { status: 500 });
  }
}
