import type { Product, ProductImage, ProductVariant } from "@/types";

const now = "2026-06-29T00:00:00.000Z";

export const productImages: ProductImage[] = [
  {
    id: "img-whey-1",
    productId: "prod-whey-elite",
    url: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=900&q=80",
    altText: "NutraForge Whey Elite protein tub",
    position: 1,
    isPrimary: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "img-gainer-1",
    productId: "prod-mass-gainer",
    url: "https://images.unsplash.com/photo-1622484212850-eb596d769edc?auto=format&fit=crop&w=900&q=80",
    altText: "PureLift mass gainer pack",
    position: 1,
    isPrimary: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "img-creatine-1",
    productId: "prod-creatine-mono",
    url: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=900&q=80",
    altText: "NutraForge creatine monohydrate jar",
    position: 1,
    isPrimary: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "img-vitamins-1",
    productId: "prod-daily-multi",
    url: "https://images.unsplash.com/photo-1471864190281-a93a3070b6de?auto=format&fit=crop&w=900&q=80",
    altText: "VitalStack daily multivitamin bottle",
    position: 1,
    isPrimary: true,
    createdAt: now,
    updatedAt: now
  }
];

export const productVariants: ProductVariant[] = [
  {
    id: "var-whey-choco-1kg",
    productId: "prod-whey-elite",
    sku: "NF-WHEY-CHOCO-1KG",
    flavor: "Double Chocolate",
    size: "1 kg",
    weightInGrams: 1000,
    mrp: 3499,
    sellingPrice: 2999,
    discountPercent: 14,
    currency: "INR",
    stock: 112,
    batchId: "batch-whey-a1",
    expiryDate: "2027-11-30",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "var-whey-vanilla-2kg",
    productId: "prod-whey-elite",
    sku: "NF-WHEY-VAN-2KG",
    flavor: "French Vanilla",
    size: "2 kg",
    weightInGrams: 2000,
    mrp: 6499,
    sellingPrice: 5499,
    discountPercent: 15,
    currency: "INR",
    stock: 48,
    batchId: "batch-whey-b2",
    expiryDate: "2027-10-31",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "var-gainer-kulfi-3kg",
    productId: "prod-mass-gainer",
    sku: "PL-GAIN-KULFI-3KG",
    flavor: "Kesar Kulfi",
    size: "3 kg",
    weightInGrams: 3000,
    mrp: 4299,
    sellingPrice: 3699,
    discountPercent: 14,
    currency: "INR",
    stock: 36,
    batchId: "batch-gainer-c1",
    expiryDate: "2027-08-31",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "var-creatine-250g",
    productId: "prod-creatine-mono",
    sku: "NF-CRTN-UNFL-250G",
    flavor: "Unflavoured",
    size: "250 g",
    weightInGrams: 250,
    mrp: 1499,
    sellingPrice: 1099,
    discountPercent: 27,
    currency: "INR",
    stock: 9,
    batchId: "batch-creatine-d1",
    expiryDate: "2028-01-31",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "var-multi-60-tabs",
    productId: "prod-daily-multi",
    sku: "VS-MULTI-60TAB",
    size: "60 tablets",
    weightInGrams: 120,
    mrp: 899,
    sellingPrice: 699,
    discountPercent: 22,
    currency: "INR",
    stock: 74,
    batchId: "batch-multi-e1",
    expiryDate: "2027-12-31",
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

export const products: Product[] = [
  {
    id: "prod-whey-elite",
    slug: "nutraforge-whey-elite",
    name: "NutraForge Whey Elite",
    shortDescription: "Fast-mixing whey protein with digestive enzyme support.",
    description:
      "A premium whey protein blend designed to support daily protein intake and post-workout nutrition.",
    brandId: "brand-nutraforge",
    categoryIds: ["cat-protein"],
    collectionIds: ["col-best-sellers"],
    status: "active",
    goalTags: ["Muscle support", "Post-workout"],
    nutritionFacts: [
      { name: "Protein", amount: "25 g" },
      { name: "BCAA", amount: "5.5 g" },
      { name: "Sugar", amount: "1.2 g" }
    ],
    ingredients: ["Whey protein concentrate", "Cocoa powder", "Digestive enzymes", "Stevia"],
    allergens: ["Milk", "Soy"],
    usageInstructions: "Mix one scoop with 180-220 ml water or milk after training or as needed.",
    warningText:
      "Use as a dietary supplement only. Not intended to diagnose, treat, cure, or prevent any disease.",
    labelImageUrls: ["/assets/labels/whey-elite-label.png"],
    labReportUrl: "/assets/reports/whey-elite-lab-report.pdf",
    images: productImages.filter((image) => image.productId === "prod-whey-elite"),
    variants: productVariants.filter((variant) => variant.productId === "prod-whey-elite"),
    seoTitle: "NutraForge Whey Elite Protein Powder",
    seoDescription: "Premium whey protein powder with chocolate and vanilla flavors.",
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-mass-gainer",
    slug: "purelift-mass-gainer",
    name: "PureLift Mass Gainer",
    shortDescription: "High-calorie nutrition support for bulking phases.",
    description:
      "A calorie-dense mass gainer with protein, carbohydrates, and vitamins for intense training plans.",
    brandId: "brand-purelift",
    categoryIds: ["cat-protein"],
    collectionIds: ["col-weight-gain"],
    status: "active",
    goalTags: ["Weight gain", "Bulking"],
    nutritionFacts: [
      { name: "Calories", amount: "640 kcal" },
      { name: "Protein", amount: "32 g" },
      { name: "Carbohydrate", amount: "108 g" }
    ],
    ingredients: ["Maltodextrin", "Whey protein", "MCT powder", "Vitamin blend"],
    allergens: ["Milk", "Soy"],
    usageInstructions: "Mix two scoops with 350 ml milk or water between meals.",
    warningText:
      "Do not exceed recommended serving. This supplement is not a substitute for a varied diet.",
    labelImageUrls: ["/assets/labels/mass-gainer-label.png"],
    images: productImages.filter((image) => image.productId === "prod-mass-gainer"),
    variants: productVariants.filter((variant) => variant.productId === "prod-mass-gainer"),
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-creatine-mono",
    slug: "nutraforge-creatine-monohydrate",
    name: "NutraForge Creatine Monohydrate",
    shortDescription: "Micronized unflavoured creatine for strength training routines.",
    description:
      "Single-ingredient creatine monohydrate designed for easy mixing and everyday use.",
    brandId: "brand-nutraforge",
    categoryIds: ["cat-performance"],
    collectionIds: ["col-best-sellers"],
    status: "active",
    goalTags: ["Strength", "Performance"],
    nutritionFacts: [{ name: "Creatine monohydrate", amount: "3 g" }],
    ingredients: ["Creatine monohydrate"],
    allergens: [],
    usageInstructions: "Mix 3 g with water once daily. Use consistently for best routine adherence.",
    warningText: "Consult a qualified professional if pregnant, nursing, or under medical supervision.",
    labelImageUrls: ["/assets/labels/creatine-label.png"],
    labReportUrl: "/assets/reports/creatine-lab-report.pdf",
    images: productImages.filter((image) => image.productId === "prod-creatine-mono"),
    variants: productVariants.filter((variant) => variant.productId === "prod-creatine-mono"),
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-daily-multi",
    slug: "vitalstack-daily-multivitamin",
    name: "VitalStack Daily Multivitamin",
    shortDescription: "Daily vitamin and mineral support for active lifestyles.",
    description:
      "A balanced daily multivitamin formulated to complement a healthy diet and training schedule.",
    brandId: "brand-vitalstack",
    categoryIds: ["cat-vitamins"],
    collectionIds: ["col-wellness"],
    status: "active",
    goalTags: ["Wellness", "Daily routine"],
    nutritionFacts: [
      { name: "Vitamin C", amount: "80 mg", dailyValuePercent: 100 },
      { name: "Zinc", amount: "10 mg", dailyValuePercent: 91 },
      { name: "Vitamin D3", amount: "600 IU", dailyValuePercent: 100 }
    ],
    ingredients: ["Vitamin blend", "Mineral blend", "Microcrystalline cellulose"],
    allergens: [],
    usageInstructions: "Take one tablet daily with a meal.",
    warningText: "Keep out of reach of children. Do not use if seal is broken.",
    labelImageUrls: ["/assets/labels/daily-multi-label.png"],
    images: productImages.filter((image) => image.productId === "prod-daily-multi"),
    variants: productVariants.filter((variant) => variant.productId === "prod-daily-multi"),
    createdAt: now,
    updatedAt: now
  }
];

export const featuredProducts = products.filter((product) => product.status === "active");
