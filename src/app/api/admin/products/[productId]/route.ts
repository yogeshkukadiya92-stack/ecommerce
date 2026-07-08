import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

const productUpdateSchema = z.object({
  allergens: z.string().optional(),
  brandName: z.string().min(2),
  categoryName: z.string().min(2),
  description: z.string().min(10),
  goalTags: z.string().optional(),
  imageUrl: z
    .string()
    .refine((value) => value === "" || value.startsWith("/") || z.string().url().safeParse(value).success, {
      message: "Enter a valid image URL or upload an image."
    })
    .optional(),
  ingredients: z.string().optional(),
  mrp: z.number().positive(),
  name: z.string().min(3),
  sellingPrice: z.number().positive(),
  shortDescription: z.string().min(8),
  size: z.string().optional(),
  sku: z.string().min(3),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  status: z.enum(["DRAFT", "ACTIVE"]),
  stock: z.number().int().min(0),
  usageInstructions: z.string().optional(),
  warningText: z.string().optional(),
  weightInGrams: z.number().int().positive()
});

export async function PATCH(request: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await context.params;
    const input = productUpdateSchema.parse(await request.json());
    const existingProduct = await prisma.product.findUnique({
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true
      },
      where: { id: productId }
    });

    if (!existingProduct || existingProduct.variants.length === 0) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    const conflictingProduct = await prisma.product.findUnique({ where: { slug: input.slug.trim().toLowerCase() } });
    const conflictingVariant = await prisma.productVariant.findUnique({ where: { sku: input.sku.trim().toUpperCase() } });

    if ((conflictingProduct && conflictingProduct.id !== productId) || (conflictingVariant && conflictingVariant.productId !== productId)) {
      return NextResponse.json({ message: "Product slug or SKU already exists." }, { status: 409 });
    }

    const brand = await getOrCreateBrand(input.brandName);
    const category = await getOrCreateCategory(input.categoryName);
    const slug = input.slug.trim().toLowerCase();
    const sku = input.sku.trim().toUpperCase();
    const discountPercent = Math.max(0, Math.round(((input.mrp - input.sellingPrice) / input.mrp) * 100));
    const primaryImage = existingProduct.images[0];
    const primaryVariant = existingProduct.variants[0];

    const product = await prisma.product.update({
      data: {
        allergens: splitList(input.allergens),
        brandId: brand.id,
        categoryIds: [category.id],
        description: input.description.trim(),
        goalTags: splitList(input.goalTags),
        ingredients: splitList(input.ingredients),
        name: input.name.trim(),
        shortDescription: input.shortDescription.trim(),
        slug,
        status: input.status,
        usageInstructions: input.usageInstructions?.trim() || "Use as directed on the product label.",
        warningText:
          input.warningText?.trim() ||
          "This product is not intended to diagnose, treat, cure, or prevent any disease. Not for medicinal use."
      },
      include: {
        brand: true,
        categories: true,
        images: true,
        variants: true
      },
      where: {
        id: productId
      }
    });

    await prisma.productVariant.update({
      data: {
        discountPercent,
        isActive: input.status === "ACTIVE",
        mrp: input.mrp,
        sellingPrice: input.sellingPrice,
        size: input.size?.trim() || undefined,
        sku,
        stock: input.stock,
        weightInGrams: input.weightInGrams
      },
      where: {
        id: primaryVariant.id
      }
    });

    if (input.imageUrl?.trim()) {
      if (primaryImage) {
        await prisma.productImage.update({
          data: {
            altText: input.name.trim(),
            url: input.imageUrl.trim()
          },
          where: {
            id: primaryImage.id
          }
        });
      } else {
        await prisma.productImage.create({
          data: {
            altText: input.name.trim(),
            isPrimary: true,
            position: 1,
            productId,
            url: input.imageUrl.trim()
          }
        });
      }
    } else if (primaryImage) {
      await prisma.productImage.delete({
        where: {
          id: primaryImage.id
        }
      });
    }

    return NextResponse.json({
      message: "Product updated successfully.",
      product
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Product slug or SKU already exists." }, { status: 409 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Enter valid product details." }, { status: 400 });
    }

    return NextResponse.json({ message: "Unable to update product right now." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await context.params;
    const existingProduct = await prisma.product.findUnique({
      where: {
        id: productId
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ message: "Product not found." }, { status: 404 });
    }

    await prisma.product.delete({
      where: {
        id: productId
      }
    });

    return NextResponse.json({
      message: "Product deleted successfully."
    });
  } catch {
    return NextResponse.json({ message: "Unable to delete product right now." }, { status: 500 });
  }
}

async function getOrCreateBrand(name: string) {
  const normalizedName = name.trim();
  const slug = slugify(normalizedName);
  return prisma.brand.upsert({
    create: {
      description: `${normalizedName} products`,
      name: normalizedName,
      slug
    },
    update: {},
    where: {
      slug
    }
  });
}

async function getOrCreateCategory(name: string) {
  const normalizedName = name.trim();
  const slug = slugify(normalizedName);
  return prisma.category.upsert({
    create: {
      description: `${normalizedName} category`,
      name: normalizedName,
      productIds: [],
      slug
    },
    update: {},
    where: {
      slug
    }
  });
}

function splitList(value?: string) {
  return (value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
