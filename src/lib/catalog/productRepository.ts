import { prisma } from "@/lib/db/prisma";

export async function listActiveProducts(query?: string | null) {
  const products = await prisma.product.findMany({
    include: {
      brand: true,
      categories: true,
      collections: true,
      images: { orderBy: { position: "asc" } },
      variants: true
    },
    orderBy: { createdAt: "desc" },
    where: { status: "ACTIVE" }
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
