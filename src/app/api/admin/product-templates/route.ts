import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const templateInputSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  label: z.string().trim().min(2).max(80)
});

export async function GET() {
  const templates = await prisma.productTemplate.findMany({
    orderBy: {
      label: "asc"
    }
  });

  return NextResponse.json({
    data: templates.map((template) => ({
      data: template.data,
      id: template.id,
      label: template.label
    }))
  });
}

export async function POST(request: Request) {
  try {
    const input = templateInputSchema.parse(await request.json());
    const data = input.data as Prisma.InputJsonValue;

    const template = await prisma.productTemplate.upsert({
      create: {
        data,
        label: input.label
      },
      update: {
        data
      },
      where: {
        label: input.label
      }
    });

    return NextResponse.json(
      {
        message: `Template "${template.label}" saved.`,
        template: {
          data: template.data,
          id: template.id,
          label: template.label
        }
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Enter a template name between 2 and 80 characters." }, { status: 400 });
    }

    console.error("Product template save failed", error);
    return NextResponse.json({ message: "Unable to save template right now." }, { status: 500 });
  }
}
