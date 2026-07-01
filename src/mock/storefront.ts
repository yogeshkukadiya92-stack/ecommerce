import type { Product } from "@/types";
import { brands } from "./brands";
import { categories } from "./categories";
import { products } from "./products";

export type DietaryType = "veg" | "non-veg" | "vegan";

export type ProductMerchandising = {
  productId: string;
  brandName: string;
  categorySlug: string;
  rating: number;
  reviewCount: number;
  popularity: number;
  pricePerServing: number;
  proteinPerServing: number;
  servingsCount: number;
  flavors: string[];
  sizes: string[];
  dietaryType: DietaryType;
  isSugarFree: boolean;
  isGlutenFree: boolean;
  isLactoseFree: boolean;
  isSubscriptionAvailable: boolean;
  isNewArrival: boolean;
  collectionSlugs: string[];
};

export type StorefrontProduct = Product & {
  merchandising: ProductMerchandising;
};

export type ProductDetailContent = {
  authenticity: {
    batchNumberExample: string;
    expiryExample: string;
    qrVerification: string;
    serialVerification: string;
  };
  compareProductIds: string[];
  faq: Array<{ answer: string; question: string }>;
  frequentlyBoughtTogetherIds: string[];
  questions: Array<{
    answer: string;
    answeredBy: string;
    isAdminAnswered: boolean;
    question: string;
  }>;
  ratingBreakdown: Array<{ count: number; rating: 1 | 2 | 3 | 4 | 5 }>;
  recommendedStackIds: string[];
  reviews: Array<{
    body: string;
    customerName: string;
    isVerifiedPurchase: boolean;
    mediaPlaceholder: string;
    rating: 1 | 2 | 3 | 4 | 5;
    tags: string[];
    title: string;
  }>;
  storageInstructions: string;
  videoUrl?: string;
};

export const goalCards = [
  {
    slug: "muscle-gain",
    title: "Muscle Gain",
    description: "Protein and calorie support for structured bulking routines.",
    href: "/collections/muscle-gain"
  },
  {
    slug: "fat-loss",
    title: "Fat Loss",
    description: "Lean stacks, low-sugar picks, and wellness essentials.",
    href: "/collections/fat-loss"
  },
  {
    slug: "strength",
    title: "Strength",
    description: "Creatine and performance staples for consistent training.",
    href: "/products?goal=Strength"
  },
  {
    slug: "recovery",
    title: "Recovery",
    description: "Post-workout nutrition and daily recovery support.",
    href: "/products?goal=Recovery"
  },
  {
    slug: "daily-wellness",
    title: "Daily Wellness",
    description: "Vitamins and everyday supplements for active lifestyles.",
    href: "/collections/daily-wellness"
  },
  {
    slug: "vegan",
    title: "Vegan",
    description: "Plant-forward protein and wellness choices.",
    href: "/collections/vegan-protein"
  }
] as const;

export const collectionDefinitions = [
  {
    slug: "best-sellers",
    title: "Best Sellers",
    description: "The most trusted products from our sample catalog.",
    productIds: ["prod-whey-elite", "prod-creatine-mono", "prod-daily-multi", "prod-mass-gainer"]
  },
  {
    slug: "new-arrivals",
    title: "New Arrivals",
    description: "Recently added supplements and wellness essentials.",
    productIds: ["prod-daily-multi", "prod-creatine-mono"]
  },
  {
    slug: "muscle-gain",
    title: "Muscle Gain",
    description: "Protein and mass-gainer picks for calorie and protein targets.",
    productIds: ["prod-whey-elite", "prod-mass-gainer", "prod-creatine-mono"]
  },
  {
    slug: "fat-loss",
    title: "Fat Loss",
    description: "Lean routine support with clear labels and low-sugar picks.",
    productIds: ["prod-whey-elite", "prod-daily-multi"]
  },
  {
    slug: "vegan-protein",
    title: "Vegan Protein",
    description: "Vegan-ready discovery page, prepared for plant protein catalog growth.",
    productIds: ["prod-daily-multi"]
  },
  {
    slug: "daily-wellness",
    title: "Daily Wellness",
    description: "Daily vitamins and health-support supplements for active routines.",
    productIds: ["prod-daily-multi"]
  },
  {
    slug: "combo-deals",
    title: "Combo Deals",
    description: "Bundle-friendly product combinations and stack-building offers.",
    productIds: ["prod-whey-elite", "prod-creatine-mono", "prod-daily-multi"]
  }
] as const;

export const popularSearches = [
  "whey protein",
  "creatine",
  "mass gainer",
  "daily multivitamin",
  "low sugar protein",
  "lab report"
] as const;

export const blogPreviewPosts = [
  {
    slug: "how-to-read-protein-label",
    title: "How to read a protein label before you buy",
    excerpt: "Serving size, protein content, allergens, and lab-report cues to compare clearly."
  },
  {
    slug: "creatine-routine-basics",
    title: "Creatine routine basics for strength training",
    excerpt: "Simple shopping guidance without cure claims or exaggerated promises."
  },
  {
    slug: "build-a-daily-wellness-stack",
    title: "Build a daily wellness stack",
    excerpt: "A practical way to pair vitamins, protein, and training essentials."
  }
] as const;

export const testimonials = [
  {
    name: "Aarav M.",
    title: "Strength training regular",
    quote: "The product cards make price, servings, and stock status easy to compare on mobile."
  },
  {
    name: "Nisha R.",
    title: "Daily wellness shopper",
    quote: "I like seeing allergens, lab-report availability, and clear supplement warnings up front."
  },
  {
    name: "Kabir S.",
    title: "Weekend athlete",
    quote: "The quick-add layout feels fast without hiding important product details."
  }
] as const;

const merchandisingByProductId: Record<string, ProductMerchandising> = {
  "prod-whey-elite": {
    productId: "prod-whey-elite",
    brandName: "NutraForge",
    categorySlug: "protein-powders",
    rating: 4.8,
    reviewCount: 2345,
    popularity: 98,
    pricePerServing: 99,
    proteinPerServing: 25,
    servingsCount: 30,
    flavors: ["Double Chocolate", "French Vanilla"],
    sizes: ["1 kg", "2 kg"],
    dietaryType: "veg",
    isSugarFree: false,
    isGlutenFree: true,
    isLactoseFree: false,
    isSubscriptionAvailable: true,
    isNewArrival: false,
    collectionSlugs: ["best-sellers", "muscle-gain", "fat-loss", "combo-deals"]
  },
  "prod-mass-gainer": {
    productId: "prod-mass-gainer",
    brandName: "PureLift",
    categorySlug: "protein-powders",
    rating: 4.5,
    reviewCount: 980,
    popularity: 74,
    pricePerServing: 123,
    proteinPerServing: 32,
    servingsCount: 30,
    flavors: ["Kesar Kulfi"],
    sizes: ["3 kg"],
    dietaryType: "veg",
    isSugarFree: false,
    isGlutenFree: false,
    isLactoseFree: false,
    isSubscriptionAvailable: false,
    isNewArrival: false,
    collectionSlugs: ["best-sellers", "muscle-gain"]
  },
  "prod-creatine-mono": {
    productId: "prod-creatine-mono",
    brandName: "NutraForge",
    categorySlug: "performance",
    rating: 4.9,
    reviewCount: 1830,
    popularity: 94,
    pricePerServing: 13,
    proteinPerServing: 0,
    servingsCount: 83,
    flavors: ["Unflavoured"],
    sizes: ["250 g"],
    dietaryType: "vegan",
    isSugarFree: true,
    isGlutenFree: true,
    isLactoseFree: true,
    isSubscriptionAvailable: true,
    isNewArrival: true,
    collectionSlugs: ["best-sellers", "new-arrivals", "muscle-gain", "combo-deals"]
  },
  "prod-daily-multi": {
    productId: "prod-daily-multi",
    brandName: "VitalStack",
    categorySlug: "vitamins-wellness",
    rating: 4.6,
    reviewCount: 642,
    popularity: 81,
    pricePerServing: 12,
    proteinPerServing: 0,
    servingsCount: 60,
    flavors: ["Tablet"],
    sizes: ["60 tablets"],
    dietaryType: "vegan",
    isSugarFree: true,
    isGlutenFree: true,
    isLactoseFree: true,
    isSubscriptionAvailable: true,
    isNewArrival: true,
    collectionSlugs: ["best-sellers", "new-arrivals", "daily-wellness", "fat-loss", "vegan-protein", "combo-deals"]
  }
};

export const productDetailContentById: Record<string, ProductDetailContent> = {
  "prod-whey-elite": {
    authenticity: {
      batchNumberExample: "WF-A1-1127",
      expiryExample: "30 Nov 2027",
      qrVerification: "QR verification ready for admin-managed serial checks.",
      serialVerification: "Serial code can be matched against future inventory batch records."
    },
    compareProductIds: ["prod-mass-gainer", "prod-creatine-mono", "prod-daily-multi"],
    faq: [
      {
        question: "Is this product for medical use?",
        answer: "No. This is a dietary supplement and is not for medicinal use."
      },
      {
        question: "Can I use it with milk?",
        answer: "Yes, it can be mixed with water or milk depending on your nutrition routine."
      },
      {
        question: "Does the product show expiry information?",
        answer: "Yes. The inventory foundation supports batch number and expiry visibility."
      }
    ],
    frequentlyBoughtTogetherIds: ["prod-creatine-mono", "prod-daily-multi"],
    questions: [
      {
        question: "Is the chocolate flavor very sweet?",
        answer: "It is designed to be moderate. Taste can vary by mixing liquid and serving size.",
        answeredBy: "FitSupplement Admin",
        isAdminAnswered: true
      },
      {
        question: "Can beginners use this?",
        answer: "Beginners can use protein supplements to support dietary protein intake, but should follow label directions.",
        answeredBy: "FitSupplement Admin",
        isAdminAnswered: true
      }
    ],
    ratingBreakdown: [
      { rating: 5, count: 1560 },
      { rating: 4, count: 540 },
      { rating: 3, count: 170 },
      { rating: 2, count: 50 },
      { rating: 1, count: 25 }
    ],
    recommendedStackIds: ["prod-creatine-mono"],
    reviews: [
      {
        body: "Mixes quickly and the serving info is easy to compare. I like seeing batch and lab-report cues.",
        customerName: "Aarav M.",
        isVerifiedPurchase: true,
        mediaPlaceholder: "Photo review",
        rating: 5,
        tags: ["Taste", "Mixability", "Value"],
        title: "Clean product card details"
      },
      {
        body: "Good everyday protein option. The warning and allergen information feels clear.",
        customerName: "Nisha R.",
        isVerifiedPurchase: true,
        mediaPlaceholder: "Video review",
        rating: 4,
        tags: ["Taste", "Label clarity"],
        title: "Clear supplement information"
      }
    ],
    storageInstructions:
      "Store in a cool, dry place away from direct sunlight. Keep the lid tightly closed after opening.",
    videoUrl: "Product routine guide"
  },
  "prod-mass-gainer": {
    authenticity: {
      batchNumberExample: "PL-C1-0827",
      expiryExample: "31 Aug 2027",
      qrVerification: "QR verification ready for packaging scans.",
      serialVerification: "Serial lookup can be connected to warehouse batch records later."
    },
    compareProductIds: ["prod-whey-elite", "prod-creatine-mono"],
    faq: [
      {
        question: "Is this a meal replacement?",
        answer: "No. It is a dietary supplement and should not replace a varied diet."
      },
      {
        question: "When should I use it?",
        answer: "Follow label directions. Many shoppers use mass gainers between meals."
      }
    ],
    frequentlyBoughtTogetherIds: ["prod-whey-elite", "prod-creatine-mono"],
    questions: [
      {
        question: "Does this include vitamins?",
        answer: "Yes, the sample product includes a vitamin blend in the ingredient list.",
        answeredBy: "FitSupplement Admin",
        isAdminAnswered: true
      }
    ],
    ratingBreakdown: [
      { rating: 5, count: 520 },
      { rating: 4, count: 300 },
      { rating: 3, count: 110 },
      { rating: 2, count: 35 },
      { rating: 1, count: 15 }
    ],
    recommendedStackIds: ["prod-creatine-mono"],
    reviews: [
      {
        body: "Useful for comparing calories and serving details before adding to cart.",
        customerName: "Kabir S.",
        isVerifiedPurchase: true,
        mediaPlaceholder: "Photo review",
        rating: 5,
        tags: ["Value", "Serving size"],
        title: "Helpful comparison details"
      }
    ],
    storageInstructions:
      "Store sealed in a cool, dry place. Use a dry scoop and avoid moisture exposure."
  },
  "prod-creatine-mono": {
    authenticity: {
      batchNumberExample: "NF-D1-0128",
      expiryExample: "31 Jan 2028",
      qrVerification: "QR verification ready for authenticity scans.",
      serialVerification: "Serial verification can be mapped to supplier and batch records."
    },
    compareProductIds: ["prod-whey-elite", "prod-daily-multi"],
    faq: [
      {
        question: "Is this flavoured?",
        answer: "No. The sample variant is unflavoured."
      },
      {
        question: "Is this sugar-free?",
        answer: "Yes. The sample merchandising data marks this product as sugar-free."
      }
    ],
    frequentlyBoughtTogetherIds: ["prod-whey-elite"],
    questions: [
      {
        question: "Does it mix with juice?",
        answer: "It can be mixed with a beverage of choice. Follow the serving instructions on label.",
        answeredBy: "FitSupplement Admin",
        isAdminAnswered: true
      }
    ],
    ratingBreakdown: [
      { rating: 5, count: 1320 },
      { rating: 4, count: 390 },
      { rating: 3, count: 85 },
      { rating: 2, count: 25 },
      { rating: 1, count: 10 }
    ],
    recommendedStackIds: ["prod-whey-elite"],
    reviews: [
      {
        body: "Simple unflavoured creatine. The lab-report marker is useful.",
        customerName: "Rohan P.",
        isVerifiedPurchase: true,
        mediaPlaceholder: "Photo review",
        rating: 5,
        tags: ["Mixability", "Value"],
        title: "Straightforward product"
      }
    ],
    storageInstructions:
      "Keep sealed after use. Store in a cool, dry place away from heat and moisture."
  },
  "prod-daily-multi": {
    authenticity: {
      batchNumberExample: "VS-E1-1227",
      expiryExample: "31 Dec 2027",
      qrVerification: "QR verification ready for label scans.",
      serialVerification: "Serial lookup can be connected to purchase order records."
    },
    compareProductIds: ["prod-whey-elite", "prod-creatine-mono"],
    faq: [
      {
        question: "Can I take this daily?",
        answer: "Follow the label directions and consult a qualified professional if needed."
      },
      {
        question: "Is it vegetarian?",
        answer: "The sample data marks this item as vegan-ready."
      }
    ],
    frequentlyBoughtTogetherIds: ["prod-whey-elite"],
    questions: [
      {
        question: "Should this be taken with food?",
        answer: "The sample usage instruction says to take one tablet daily with a meal.",
        answeredBy: "FitSupplement Admin",
        isAdminAnswered: true
      }
    ],
    ratingBreakdown: [
      { rating: 5, count: 380 },
      { rating: 4, count: 180 },
      { rating: 3, count: 55 },
      { rating: 2, count: 18 },
      { rating: 1, count: 9 }
    ],
    recommendedStackIds: ["prod-whey-elite"],
    reviews: [
      {
        body: "Easy to understand daily wellness option with clear warning text.",
        customerName: "Meera K.",
        isVerifiedPurchase: true,
        mediaPlaceholder: "Photo review",
        rating: 4,
        tags: ["Value", "Label clarity"],
        title: "Clear daily product"
      }
    ],
    storageInstructions:
      "Store below room temperature guidance on label. Keep away from children and moisture."
  }
};

export const storefrontProducts: StorefrontProduct[] = products.map((product) => ({
  ...product,
  merchandising: merchandisingByProductId[product.id]
}));

export function getCategoryBySlug(slug: string) {
  return categories.find((category) => category.slug === slug);
}

export function getBrandBySlug(slug: string) {
  return brands.find((brand) => brand.slug === slug);
}

export function getCollectionBySlug(slug: string) {
  return collectionDefinitions.find((collection) => collection.slug === slug);
}

export function getProductsByCategory(slug: string) {
  return storefrontProducts.filter((product) => product.merchandising.categorySlug === slug);
}

export function getProductsByBrand(slug: string) {
  const brand = getBrandBySlug(slug);

  if (!brand) {
    return [];
  }

  return storefrontProducts.filter((product) => product.brandId === brand.id);
}

export function getProductsByCollection(slug: string) {
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return [];
  }

  const productIdSet = new Set<string>(collection.productIds);
  return storefrontProducts.filter((product) => productIdSet.has(product.id));
}

export function getProductBySlug(slug: string) {
  return storefrontProducts.find((product) => product.slug === slug);
}

export function getProductDetailContent(productId: string) {
  return productDetailContentById[productId];
}

export function getProductsByIds(productIds: string[]) {
  const productIdSet = new Set(productIds);
  return storefrontProducts.filter((product) => productIdSet.has(product.id));
}

export function getRelatedProducts(product: StorefrontProduct) {
  return storefrontProducts.filter(
    (candidate) =>
      candidate.id !== product.id &&
      (candidate.merchandising.categorySlug === product.merchandising.categorySlug ||
        candidate.goalTags.some((goal) => product.goalTags.includes(goal)))
  );
}
