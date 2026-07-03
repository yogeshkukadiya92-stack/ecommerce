import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const attendanceSchema = z.object({
  groupName: z.string().optional(),
  name: z.string().optional(),
  note: z.string().optional(),
  phone: z.string().min(8)
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = attendanceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ message: "Mobile number is required." }, { status: 400 });
  }

  const phone = normalizePhone(parsed.data.phone);

  if (phone.length < 10) {
    return NextResponse.json({ message: "Enter a valid mobile number." }, { status: 400 });
  }

  const lead = await prisma.whatsAppLead.findUnique({ where: { phone } });
  const name = parsed.data.name?.trim() || lead?.name;

  if (!name) {
    return NextResponse.json({ message: "Name is required for first-time attendance." }, { status: 400 });
  }

  const attendanceDate = new Date().toISOString().slice(0, 10);
  const entry = await prisma.attendanceEntry.upsert({
    create: {
      attendanceDate,
      groupName: parsed.data.groupName?.trim() || lead?.groupName,
      name,
      note: emptyToNull(parsed.data.note),
      phone
    },
    update: {
      checkedInAt: new Date(),
      groupName: parsed.data.groupName?.trim() || lead?.groupName,
      name,
      note: emptyToNull(parsed.data.note)
    },
    where: {
      attendanceDate_phone: {
        attendanceDate,
        phone
      }
    }
  });

  return NextResponse.json({
    data: entry,
    leadMatched: Boolean(lead),
    message: "Attendance marked successfully."
  });
}

export async function GET() {
  const attendanceDate = new Date().toISOString().slice(0, 10);
  const [todayCount, totalLeads] = await Promise.all([
    prisma.attendanceEntry.count({ where: { attendanceDate } }),
    prisma.whatsAppLead.count()
  ]);

  return NextResponse.json({
    data: {
      attendanceDate,
      todayCount,
      totalLeads
    }
  });
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
