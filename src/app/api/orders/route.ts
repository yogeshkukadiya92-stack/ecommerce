import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const addressSchema = z.object({
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  city: z.string(),
  country: z.string(),
  email: z.string().email(),
  fullName: z.string(),
  phone: z.string(),
  pincode: z.string(),
  state: z.string()
});

const orderInputSchema = z.object({
  couponCode: z.string().optional(),
  discountAmount: z.number().min(0).default(0),
  items: z
    .array(
      z.object({
        productName: z.string(),
        quantity: z.number().int().positive(),
        sku: z.string(),
        total: z.number().min(0),
        unitPrice: z.number().min(0)
      })
    )
    .min(1),
  orderNumber: z.string().min(4),
  payment: z.object({
    method: z.string(),
    provider: z.string(),
    providerOrderId: z.string().optional(),
    status: z.string(),
    transactionId: z.string().optional()
  }),
  shippingAddress: addressSchema,
  shippingAmount: z.number().min(0).default(0),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0)
});

export async function POST(request: Request) {
  try {
    const input = orderInputSchema.parse(await request.json());

    const existingOrder = await prisma.order.findUnique({ where: { orderNumber: input.orderNumber } });

    if (existingOrder) {
      return NextResponse.json({ message: "Order already recorded.", orderId: existingOrder.id });
    }

    const customer = await upsertCustomerFromAddress(input.shippingAddress);
    const variants = await prisma.productVariant.findMany({
      include: {
        product: true
      },
      where: {
        sku: {
          in: input.items.map((item) => item.sku.trim().toUpperCase())
        }
      }
    });
    const variantBySku = new Map(variants.map((variant) => [variant.sku, variant]));
    const resolvedItems = input.items.flatMap((item) => {
      const variant = variantBySku.get(item.sku.trim().toUpperCase());
      return variant ? [{ item, variant }] : [];
    });

    const isPaid = input.payment.status === "paid";
    const addressJson = input.shippingAddress as Prisma.InputJsonValue;

    const order = await prisma.order.create({
      data: {
        billingAddress: addressJson,
        couponCode: input.couponCode || undefined,
        customerId: customer.id,
        discountAmount: input.discountAmount,
        items: {
          create: resolvedItems.map(({ item, variant }) => ({
            productId: variant.productId,
            productName: item.productName,
            productVariantId: variant.id,
            quantity: item.quantity,
            sku: variant.sku,
            totalAmount: item.total,
            unitPrice: item.unitPrice
          }))
        },
        orderNumber: input.orderNumber,
        payment:
          input.payment.provider === "razorpay" || input.payment.provider === "stripe" || input.payment.provider === "cashfree"
            ? {
                create: {
                  amount: input.totalAmount,
                  paidAt: isPaid ? new Date() : undefined,
                  provider: input.payment.provider.toUpperCase() as "RAZORPAY" | "STRIPE" | "CASHFREE",
                  providerOrderId: input.payment.providerOrderId,
                  providerPaymentId: input.payment.transactionId,
                  status: isPaid ? "PAID" : "PENDING"
                }
              }
            : undefined,
        shippingAddress: addressJson,
        shippingAmount: input.shippingAmount,
        status: isPaid || input.payment.provider === "cod" ? "CONFIRMED" : "PENDING",
        subtotal: input.subtotal,
        taxAmount: input.taxAmount,
        totalAmount: input.totalAmount
      }
    });

    await Promise.all(
      resolvedItems.map(({ item, variant }) =>
        prisma.productVariant.update({
          data: {
            stock: Math.max(0, variant.stock - item.quantity)
          },
          where: {
            id: variant.id
          }
        })
      )
    );

    return NextResponse.json({ message: "Order recorded.", orderId: order.id }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid order payload." }, { status: 400 });
    }

    console.error("Order persistence failed", error);
    return NextResponse.json({ message: "Unable to record order." }, { status: 500 });
  }
}

async function upsertCustomerFromAddress(address: z.infer<typeof addressSchema>) {
  const email = address.email.trim().toLowerCase();
  const nameParts = address.fullName.trim().split(/\s+/);
  const firstName = nameParts[0] ?? "Customer";
  const lastName = nameParts.slice(1).join(" ") || "-";

  return prisma.customer.upsert({
    create: {
      email,
      firstName,
      lastName,
      phone: address.phone
    },
    update: {
      firstName,
      lastName,
      phone: address.phone
    },
    where: {
      email
    }
  });
}
