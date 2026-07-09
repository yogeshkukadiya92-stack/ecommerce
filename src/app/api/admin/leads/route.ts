import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/apiAuth";
import { prisma } from "@/lib/db/prisma";

const leadSchema = z.object({
  groupName: z.string().min(1),
  isGroupAdmin: z.boolean().optional(),
  name: z.string().min(1),
  note: z.string().optional(),
  phone: z.string().min(8),
  specialAttention: z.string().optional()
});

export async function GET(request: Request) {
  const auth = requireAdminPermission(request, "customers:read");

  if (auth.response) {
    return auth.response;
  }

  const leads = await prisma.whatsAppLead.findMany({
    orderBy: [{ groupName: "asc" }, { name: "asc" }],
    take: 1000
  });

  const groups = [...new Set(leads.map((lead) => lead.groupName))].sort();

  return NextResponse.json({
    data: leads,
    meta: {
      admins: leads.filter((lead) => lead.isGroupAdmin).length,
      groups: groups.length,
      total: leads.length
    }
  });
}

export async function POST(request: Request) {
  const auth = requireAdminPermission(request, "customers:read");

  if (auth.response) {
    return auth.response;
  }

  const body = await request.json().catch(() => null);
  const parsed = leadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Lead name, phone, and group are required." }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);

  if (phone.length < 10) {
    return NextResponse.json({ message: "Enter a valid phone number." }, { status: 400 });
  }

  const lead = await prisma.whatsAppLead.upsert({
    create: {
      groupName: parsed.data.groupName.trim(),
      isGroupAdmin: parsed.data.isGroupAdmin ?? false,
      name: parsed.data.name.trim(),
      note: emptyToNull(parsed.data.note),
      phone,
      specialAttention: emptyToNull(parsed.data.specialAttention)
    },
    update: {
      groupName: parsed.data.groupName.trim(),
      isGroupAdmin: parsed.data.isGroupAdmin ?? false,
      name: parsed.data.name.trim(),
      note: emptyToNull(parsed.data.note),
      specialAttention: emptyToNull(parsed.data.specialAttention)
    },
    where: { phone }
  });

  return NextResponse.json({ data: lead, message: "Lead saved." });
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) return `91${digits}`;
  return digits;
}

function emptyToNull(value?: string) {
  const nextValue = value?.trim();
  return nextValue ? nextValue : null;
}
