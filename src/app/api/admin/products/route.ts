import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminPermission } from "@/lib/admin/apiAuth";
import { listProducts } from "@/lib/catalog/productRepository";
import { prisma } from "@/lib/db/prisma";

const productVariantInputSchema = z.object({
  flavor: z.string().optional(),
  id: z.string().optional(),
  mrp: z.number().positive(),
  sellingPrice: z.number().positive(),
  size: z.string().optional(),
  sku: z.string().min(3),
  stock: z.number().int().min(0),
  weightInGrams: z.number().int().positive()
});

const productInputSchema = z.object({
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
  imageUrls: z
    .array(
      z.string().refine((value) => value === "" || value.startsWith("/") || z.string().url().safeParse(value).success, {
        message: "Enter valid image URLs or upload images."
      })
    )
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
  weightInGrams: z.number().int().positive(),
  variants: z.array(productVariantInputSchema).optional()
});

export async function GET(request: Request) {
  const auth = requireAdminPermission(request, "catalog:read");

  if (auth.response) {
    return auth.response;
  }

  const url = new URL(request.url);
  const products = await listProducts(url.searchParams.get("q"));

  return NextResponse.json({
    data: products,
    meta: {
      source: "database",
      total: products.length
    }
  });
}

export async function POST(request: Request) {
  const auth = requireAdminPermission(request, "product:create");

  if (auth.response) {
    return auth.response;
  }

  try {
    const input = productInputSchema.parse(await request.json());
    const slug = input.slug.trim().toLowerCase();
    const variants = normalizeVariants(input);
    const variantSkus = variants.map((variant) => variant.sku);

    if (new Set(variantSkus).size !== variantSkus.length) {
      return NextResponse.json({ message: "Every flavor needs a unique SKU." }, { status: 409 });
    }

    const existingProduct = await prisma.product.findUnique({ where: { slug } });
    const existingVariant = await prisma.productVariant.findFirst({ where: { sku: { in: variantSkus } } });

    if (existingProduct || existingVariant) {
      return NextResponse.json({ message: "Product slug or SKU already exists." }, { status: 409 });
    }

    const brand = await getOrCreateBrand(input.brandName);
    const category = await getOrCreateCategory(input.categoryName);
    const imageUrls = normalizeImageUrls(input.imageUrls, input.imageUrl);

    const product = await prisma.product.create({
      data: {
        allergens: splitList(input.allergens),
        brandId: brand.id,
        categoryIds: [category.id],
        collectionIds: [],
        description: input.description.trim(),
        goalTags: splitList(input.goalTags),
        images: imageUrls.length > 0
          ? {
              create: imageUrls.map((url, index) => ({
                altText: input.name.trim(),
                isPrimary: index === 0,
                position: index + 1,
                url
              }))
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
          create: variants.map((variant) => ({
            currency: "INR",
            discountPercent: getDiscountPercent(variant.mrp, variant.sellingPrice),
            flavor: variant.flavor || undefined,
            isActive: input.status === "ACTIVE",
            mrp: variant.mrp,
            sellingPrice: variant.sellingPrice,
            size: variant.size || undefined,
            sku: variant.sku,
            stock: variant.stock,
            weightInGrams: variant.weightInGrams
          }))
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

    if (isMongoAuthenticationError(error)) {
      return NextResponse.json(
        {
          message:
            "MongoDB login failed. Update Railway DATABASE_URL to use the current MongoDB service username and password, then redeploy."
        },
        { status: 503 }
      );
    }

    return NextResponse.json({ message: "Unable to create product. Check catalog database setup and try again." }, { status: 500 });
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

function normalizeImageUrls(imageUrls?: string[], imageUrl?: string) {
  const seen = new Set<string>();

  return [...(imageUrls ?? []), imageUrl ?? ""]
    .map((url) => url.trim())
    .filter((url) => {
      if (!url || seen.has(url)) {
        return false;
      }

      seen.add(url);
      return true;
    });
}

function normalizeVariants(input: z.infer<typeof productInputSchema>) {
  const variants = input.variants?.length
    ? input.variants
    : [
        {
          flavor: "",
          mrp: input.mrp,
          sellingPrice: input.sellingPrice,
          size: input.size,
          sku: input.sku,
          stock: input.stock,
          weightInGrams: input.weightInGrams
        }
      ];

  return variants.map((variant) => ({
    flavor: variant.flavor?.trim() ?? "",
    mrp: variant.mrp,
    sellingPrice: variant.sellingPrice,
    size: variant.size?.trim() ?? "",
    sku: variant.sku.trim().toUpperCase(),
    stock: variant.stock,
    weightInGrams: variant.weightInGrams
  }));
}

function getDiscountPercent(mrp: number, sellingPrice: number) {
  return Math.max(0, Math.round(((mrp - sellingPrice) / mrp) * 100));
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isMongoAuthenticationError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return message.includes("AuthenticationFailed") || message.includes("SCRAM failure") || message.includes("storedKey mismatch");
}
