import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { listActiveProducts } from "@/lib/catalog/productRepository";
import { prisma } from "@/lib/db/prisma";

const productInputSchema = z.object({
  allergens: z.string().optional(),
  brandName: z.string().min(2),
  categoryName: z.string().min(2),
  description: z.string().min(10),
  goalTags: z.string().optional(),
  imageUrl: z.string().url().optional().or(z.literal("")),
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

export async function GET(request: Request) {
  const url = new URL(request.url);
  const products = await listActiveProducts(url.searchParams.get("q"));

  return NextResponse.json({
    data: products,
    meta: {
      source: "database",
      total: products.length
    }
  });
}

export async function POST(request: Request) {
  try {
    const input = productInputSchema.parse(await request.json());
    const slug = input.slug.trim().toLowerCase();
    const sku = input.sku.trim().toUpperCase();
    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    const existingVariant = await prisma.productVariant.findUnique({ where: { sku } });

    if (existingProduct || existingVariant) {
      return NextResponse.json({ message: "Product slug or SKU already exists." }, { status: 409 });
    }

    const brand = await getOrCreateBrand(input.brandName);
    const category = await getOrCreateCategory(input.categoryName);
    const discountPercent = Math.max(0, Math.round(((input.mrp - input.sellingPrice) / input.mrp) * 100));

    const product = await prisma.product.create({
      data: {
        allergens: splitList(input.allergens),
        brandId: brand.id,
        categoryIds: [category.id],
        collectionIds: [],
        description: input.description.trim(),
        goalTags: splitList(input.goalTags),
        images: input.imageUrl
          ? {
              create: {
                altText: input.name.trim(),
                isPrimary: true,
                position: 1,
                url: input.imageUrl
              }
            }
          : undefined,
        ingredients: splitList(input.ingredients),
        labelImageUrls: [],
        name: input.name.trim(),
        nutritionFacts: [],
        shortDescription: input.shortDescription.trim(),
        slug,
        status: input.status,
        usageInstructions: input.usageInstructions?.trim() || "Use as directed on the product label.",
        variants: {
          create: {
            currency: "INR",
            discountPercent,
            isActive: input.status === "ACTIVE",
            mrp: input.mrp,
            sellingPrice: input.sellingPrice,
            size: input.size?.trim() || undefined,
            sku,
            stock: input.stock,
            weightInGrams: input.weightInGrams
          }
        },
        warningText:
          input.warningText?.trim() ||
          "This product is not intended to diagnose, treat, cure, or prevent any disease. Not for medicinal use.",
        wishlistIds: []
      },
      include: {
        brand: true,
        categories: true,
        images: true,
        variants: true
      }
    });

    await prisma.category.update({
      data: {
        productIds: {
          push: product.id
        }
      },
      where: {
        id: category.id
      }
    });

    return NextResponse.json(
      {
        message: "Product created successfully.",
        product
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ message: "Product slug or SKU already exists." }, { status: 409 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Enter valid product details." }, { status: 400 });
    }

    console.error("Catalog product create failed", error);
    return NextResponse.json({ message: "Unable to create product. Check database setup and required catalog fields." }, { status: 500 });
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
