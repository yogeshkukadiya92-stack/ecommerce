import { prisma } from "@/lib/db/prisma";

export async function listProducts(query?: string | null, options?: { activeOnly?: boolean }) {
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      categories: true,
      collections: true,
      images: { orderBy: { position: "asc" } },
      variants: true
    },
    orderBy: { createdAt: "desc" },
    where: options?.activeOnly ? { status: "ACTIVE" } : undefined
  });
  const normalizedQuery = query?.trim().toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) =>
    [
      product.name,
      product.shortDescription,
      product.description,
      product.brand.name,
      ...product.goalTags,
      ...product.variants.map((variant) => variant.sku)
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}

export async function listActiveProducts(query?: string | null) {
  return listProducts(query, { activeOnly: true });
}
