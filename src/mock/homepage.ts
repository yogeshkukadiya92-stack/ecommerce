import type { Banner, HomepageSection } from "@/types";

const now = "2026-06-29T00:00:00.000Z";

export const homepageBanners: Banner[] = [
  {
    id: "banner-home-hero",
    title: "Premium sports nutrition, built for disciplined routines.",
    subtitle:
      "Shop verified proteins, creatine, wellness stacks, and fitness accessories with transparent labels and batch-level inventory.",
    imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d",
    mobileImageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d",
    ctaLabel: "Shop supplements",
    ctaHref: "/products",
    placement: "homepage_hero",
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];

export const homepageSections: HomepageSection[] = [
  {
    id: "home-section-hero",
    key: "hero",
    title: "Homepage hero",
    type: "hero",
    sortOrder: 1,
    isActive: true,
    config: {
      bannerId: "banner-home-hero"
    },
    createdAt: now,
    updatedAt: now
  },
  {
    id: "home-section-categories",
    key: "shop-by-category",
    title: "Shop by category",
    type: "category_grid",
    sortOrder: 2,
    isActive: true,
    config: {
      categoryIds: ["cat-protein", "cat-performance", "cat-vitamins", "cat-accessories"]
    },
    createdAt: now,
    updatedAt: now
  }
];
