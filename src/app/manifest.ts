import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f4f6f5",
    categories: ["shopping", "health", "fitness"],
    description: "Premium supplement shopping experience with fast mobile checkout.",
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "any",
        src: "/icons/icon.svg",
        type: "image/svg+xml"
      },
      {
        purpose: "maskable",
        sizes: "any",
        src: "/icons/icon.svg",
        type: "image/svg+xml"
      }
    ],
    name: "FitSupplement Store",
    orientation: "portrait",
    scope: "/",
    short_name: "FitSupplement",
    start_url: "/?source=pwa",
    theme_color: "#111315"
  };
}
