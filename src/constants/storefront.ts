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
    description: "The most trusted products from our catalog.",
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
