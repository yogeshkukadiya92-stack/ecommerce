import { NextResponse } from "next/server";
import { requireAdminPermission } from "@/lib/admin/apiAuth";
import { prisma } from "@/lib/db/prisma";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = requireAdminPermission(request, "catalog:write");

  if (auth.response) {
    return auth.response;
  }

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
