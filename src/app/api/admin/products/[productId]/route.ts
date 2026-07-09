import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
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

    if (conflictingProduct && conflictingProduct.id !== productId) {
      return NextResponse.json({ message: "Product slug or SKU already exists." }, { status: 409 });
    }

    const brand = await getOrCreateBrand(input.brandName);
    const category = await getOrCreateCategory(input.categoryName);
    const slug = input.slug.trim().toLowerCase();
    const variants = normalizeVariants(input);
    const sku = variants[0].sku;
    const variantSkus = variants.map((variant) => variant.sku);

    if (new Set(variantSkus).size !== variantSkus.length) {
      return NextResponse.json({ message: "Every flavor needs a unique SKU." }, { status: 409 });
    }

    const conflictingSubmittedVariant = await prisma.productVariant.findFirst({
      where: {
        productId: { not: productId },
        sku: { in: variantSkus }
      }
    });

    if (conflictingSubmittedVariant) {
      return NextResponse.json({ message: "Product slug or SKU already exists." }, { status: 409 });
    }

    const primaryVariant = existingProduct.variants[0];
    const imageUrls = normalizeImageUrls(input.imageUrls, input.imageUrl);

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
        discountPercent: getDiscountPercent(variants[0].mrp, variants[0].sellingPrice),
        flavor: variants[0].flavor || undefined,
        isActive: input.status === "ACTIVE",
        mrp: variants[0].mrp,
        sellingPrice: variants[0].sellingPrice,
        size: variants[0].size || undefined,
        sku,
        stock: variants[0].stock,
        weightInGrams: variants[0].weightInGrams
      },
      where: {
        id: primaryVariant.id
      }
    });

    const submittedVariantIds = new Set([primaryVariant.id]);

    for (const variant of variants.slice(1)) {
      if (variant.id && existingProduct.variants.some((item) => item.id === variant.id)) {
        submittedVariantIds.add(variant.id);
        await prisma.productVariant.update({
          data: {
            discountPercent: getDiscountPercent(variant.mrp, variant.sellingPrice),
            flavor: variant.flavor || undefined,
            isActive: input.status === "ACTIVE",
            mrp: variant.mrp,
            sellingPrice: variant.sellingPrice,
            size: variant.size || undefined,
            sku: variant.sku,
            stock: variant.stock,
            weightInGrams: variant.weightInGrams
          },
          where: {
            id: variant.id
          }
        });
      } else {
        const createdVariant = await prisma.productVariant.create({
          data: {
            currency: "INR",
            discountPercent: getDiscountPercent(variant.mrp, variant.sellingPrice),
            flavor: variant.flavor || undefined,
            isActive: input.status === "ACTIVE",
            mrp: variant.mrp,
            productId,
            sellingPrice: variant.sellingPrice,
            size: variant.size || undefined,
            sku: variant.sku,
            stock: variant.stock,
            weightInGrams: variant.weightInGrams
          }
        });
        submittedVariantIds.add(createdVariant.id);
      }
    }

    const variantsToDeactivate = existingProduct.variants.filter((variant) => !submittedVariantIds.has(variant.id));

    if (variantsToDeactivate.length > 0) {
      await prisma.productVariant.updateMany({
        data: {
          isActive: false,
          stock: 0
        },
        where: {
          id: {
            in: variantsToDeactivate.map((variant) => variant.id)
          }
        }
      });
    }

    await prisma.productImage.deleteMany({
      where: {
        productId
      }
    });

    if (imageUrls.length > 0) {
      await prisma.productImage.createMany({
        data: imageUrls.map((url, index) => ({
          altText: input.name.trim(),
          isPrimary: index === 0,
          position: index + 1,
          productId,
          url
        }))
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

function normalizeVariants(input: z.infer<typeof productUpdateSchema>) {
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
    id: variant.id,
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
