import { products } from "@/mock";

export function searchProducts(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return products;
  }

  return products.filter((product) =>
    [product.name, product.shortDescription, product.brandId, ...product.goalTags]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}
