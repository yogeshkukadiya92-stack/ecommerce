import type { Category } from "@/types";

const now = "2026-06-29T00:00:00.000Z";

export const categories: Category[] = [
  {
    id: "cat-protein",
    slug: "protein-powders",
    name: "Protein Powders",
    description: "Whey, isolate, plant, and daily protein support.",
    imageUrl: "https://images.unsplash.com/photo-1593095948071-474c5cc2989d",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "cat-performance",
    slug: "performance",
    name: "Performance",
    description: "Creatine, pre-workout, amino acids, and training support.",
    imageUrl: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "cat-vitamins",
    slug: "vitamins-wellness",
    name: "Vitamins & Wellness",
    description: "Daily health supplements for active lifestyles.",
    imageUrl: "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "cat-accessories",
    slug: "fitness-accessories",
    name: "Fitness Accessories",
    description: "Shakers, straps, storage, and gym essentials.",
    imageUrl: "https://images.unsplash.com/photo-1518611012118-696072aa579a",
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];
