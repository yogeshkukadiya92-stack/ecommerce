import {
  getProductBySlug,
  getProductsByBrand,
  getProductsByCategory,
  getProductsByCollection,
  storefrontProducts,
  type ProductDetailContent,
  type StorefrontProduct
} from "@/mock/storefront";
import { listActiveProducts, listProducts } from "@/lib/catalog/productRepository";

function toStorefrontProduct(product: Awaited<ReturnType<typeof listActiveProducts>>[number]): StorefrontProduct {
  const variant = product.variants[0];
  const size = variant?.size ?? "";
  const servingsCount = deriveServingsCount(size, variant?.weightInGrams ?? 0);
  const proteinPerServing = extractProteinPerServing(product.nutritionFacts);
  const category = product.categories[0];

  return {
    ...product,
    createdAt: product.createdAt.toISOString(),
    merchandising: {
      brandName: product.brand.name,
      categorySlug: category?.slug ?? "supplements",
      collectionSlugs: [],
      dietaryType: "veg",
      flavors: variant?.flavor ? [variant.flavor] : [],
      isGlutenFree: !product.allergens.some((item) => item.toLowerCase().includes("gluten")),
      isLactoseFree: !product.allergens.some((item) => item.toLowerCase().includes("milk")),
      isNewArrival: Date.now() - product.createdAt.getTime() < 1000 * 60 * 60 * 24 * 30,
      isSubscriptionAvailable: false,
      isSugarFree: !product.description.toLowerCase().includes("sugar"),
      popularity: 50,
      pricePerServing: variant ? Math.max(1, Math.round(variant.sellingPrice / Math.max(servingsCount, 1))) : 0,
      productId: product.id,
      proteinPerServing,
      rating: 4.7,
      reviewCount: 128,
      servingsCount,
      sizes: size ? [size] : []
    },
    status: product.status.toLowerCase() as StorefrontProduct["status"],
    updatedAt: product.updatedAt.toISOString()
  } as unknown as StorefrontProduct;
}

export async function getLiveStorefrontProducts(query?: string | null) {
  const products = await loadLiveProducts(query);
  return products ?? filterFallbackProducts(query);
}

export async function getLiveStorefrontProductsByBrand(slug: string) {
  const products = await loadLiveProducts();

  if (!products) {
    return getProductsByBrand(slug);
  }

  return products.filter((product) => toSlug(product.merchandising.brandName) === slug);
}

export async function getLiveStorefrontProductsByCategory(slug: string) {
  const products = await loadLiveProducts();
  return products ? products.filter((product) => product.merchandising.categorySlug === slug) : getProductsByCategory(slug);
}

export async function getLiveStorefrontProductsByCollection(slug: string) {
  const products = await loadLiveProducts();

  if (!products) {
    return getProductsByCollection(slug);
  }

  if (slug === "best-sellers") {
    return products.slice(0, 8);
  }

  if (slug === "new-arrivals") {
    return products.filter((product) => product.merchandising.isNewArrival).slice(0, 8);
  }

  const normalizedSlug = slug.replace(/-/g, " ").toLowerCase();
  return products.filter((product) =>
    [
      product.merchandising.categorySlug.replace(/-/g, " "),
      product.name,
      product.shortDescription,
      ...product.goalTags
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedSlug)
  );
}

export async function getLiveStorefrontProductBySlug(slug: string) {
  if (!canUseLiveCatalog()) {
    return getProductBySlug(slug) ?? null;
  }

  try {
    const products = await listProducts(undefined, { activeOnly: true });
    const product = products.find((item) => item.slug === slug);

    return product ? toStorefrontProduct(product) : null;
  } catch (error) {
    logLiveCatalogError(error);
    return getProductBySlug(slug) ?? null;
  }
}

export async function getLiveRelatedProducts(product: StorefrontProduct) {
  const products = await getLiveStorefrontProducts();
  return products.filter(
    (candidate) =>
      candidate.id !== product.id &&
      (candidate.merchandising.categorySlug === product.merchandising.categorySlug ||
        candidate.goalTags.some((goal) => product.goalTags.includes(goal)))
  );
}

export function canUseLiveStorefrontCatalog() {
  return canUseLiveCatalog();
}

export function buildLiveProductDetailContent(): ProductDetailContent {
  return {
    authenticity: {
      batchNumberExample: "Batch shown on pack",
      expiryExample: "Check printed expiry date",
      qrVerification: "Verify label and source before purchase.",
      serialVerification: "Use invoice and packaging details for authenticity checks."
    },
    compareProductIds: [],
    faq: [
      {
        answer: "Use as directed on the product label and check ingredient/allergen details before purchase.",
        question: "How should I use this product?"
      },
      {
        answer: "Store in a cool, dry place away from direct sunlight.",
        question: "How should I store this product?"
      }
    ],
    frequentlyBoughtTogetherIds: [],
    questions: [],
    ratingBreakdown: [
      { count: 64, rating: 5 },
      { count: 38, rating: 4 },
      { count: 16, rating: 3 },
      { count: 7, rating: 2 },
      { count: 3, rating: 1 }
    ],
    recommendedStackIds: [],
    reviews: [],
    storageInstructions: "Store in a cool, dry place away from sunlight."
  };
}

async function loadLiveProducts(query?: string | null) {
  if (!canUseLiveCatalog()) {
    return null;
  }

  try {
    const products = await listActiveProducts(query);
    return products.map(toStorefrontProduct);
  } catch (error) {
    logLiveCatalogError(error);
    return null;
  }
}

function canUseLiveCatalog() {
  const databaseUrl = process.env.DATABASE_URL;
  return Boolean(databaseUrl && !databaseUrl.includes("localhost:27017"));
}

function filterFallbackProducts(query?: string | null) {
  const normalizedQuery = query?.trim().toLowerCase();

  if (!normalizedQuery) {
    return storefrontProducts;
  }

  return storefrontProducts.filter((product) =>
    [
      product.name,
      product.shortDescription,
      product.description,
      ...product.variants.map((variant) => variant.sku),
      product.merchandising.brandName,
      product.merchandising.categorySlug,
      ...product.goalTags,
      ...product.ingredients
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalizedQuery)
  );
}

function logLiveCatalogError(error: unknown) {
  console.warn("Live storefront catalog unavailable; using fallback product data.", error);
}

function toSlug(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function deriveServingsCount(size: string, weightInGrams: number) {
  const normalizedSize = size.toLowerCase();
  const servingsMatch = normalizedSize.match(/(\d+)\s*servings?/);

  if (servingsMatch) {
    return Number(servingsMatch[1]);
  }

  const tabletsMatch = normalizedSize.match(/(\d+)\s*tablets?/);

  if (tabletsMatch) {
    return Number(tabletsMatch[1]);
  }

  if (weightInGrams >= 3000) return 30;
  if (weightInGrams >= 1000) return 30;
  if (weightInGrams >= 500) return 16;
  if (weightInGrams >= 250) return 8;
  return 1;
}

function extractProteinPerServing(nutritionFacts: unknown) {
  if (!Array.isArray(nutritionFacts)) {
    return 0;
  }

  for (const item of nutritionFacts) {
    if (!item || typeof item !== "object") {
      continue;
    }

    const name = "name" in item ? String(item.name).toLowerCase() : "";
    const amount = "amount" in item ? String(item.amount) : "";

    if (!name.includes("protein")) {
      continue;
    }

    const numeric = Number.parseFloat(amount);
    return Number.isFinite(numeric) ? numeric : 0;
  }

  return 0;
}
