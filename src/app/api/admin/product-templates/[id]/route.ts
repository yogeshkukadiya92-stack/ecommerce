import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  if (!/^[a-f0-9]{24}$/i.test(id)) {
    return NextResponse.json({ message: "Template not found." }, { status: 404 });
  }

  try {
    await prisma.productTemplate.delete({ where: { id } });
    return NextResponse.json({ message: "Template deleted." });
  } catch {
    return NextResponse.json({ message: "Template not found." }, { status: 404 });
  }
}
