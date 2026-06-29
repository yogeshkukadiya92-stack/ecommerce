import type { Brand } from "@/types";

const now = "2026-06-29T00:00:00.000Z";

export const brands: Brand[] = [
  {
    id: "brand-nutraforge",
    slug: "nutraforge",
    name: "NutraForge",
    description: "Evidence-aware sports nutrition for serious training routines.",
    logoUrl: "/assets/brands/nutraforge.svg",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "brand-purelift",
    slug: "purelift",
    name: "PureLift",
    description: "Clean-label supplements focused on daily consistency.",
    logoUrl: "/assets/brands/purelift.svg",
    isActive: true,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "brand-vitalstack",
    slug: "vitalstack",
    name: "VitalStack",
    description: "Wellness essentials for active professionals.",
    logoUrl: "/assets/brands/vitalstack.svg",
    isActive: true,
    createdAt: now,
    updatedAt: now
  }
];
