import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductListingShell } from "@/components/storefront/ProductListingShell";
import { breadcrumbSchema, buildSeoMetadata, collectionSchema } from "@/lib/seo/seo";
import { getLiveStorefrontProducts } from "@/lib/storefront/liveCatalog";

export const metadata: Metadata = buildSeoMetadata({
  canonicalPath: "/products",
  description:
    "Shop protein powders, creatine, mass gainers, vitamins, wellness supplements, and fitness accessories with filters and clear pricing.",
  title: "Shop Supplements"
});

export default async function ProductsPage() {
  const products = await getLiveStorefrontProducts();

  return (
    <SiteShell>
      <JsonLd data={collectionSchema("Shop supplements", metadata.description as string, "/products")} />
      <JsonLd data={breadcrumbSchema([{ href: "/", label: "Home" }, { href: "/products", label: "Products" }])} />
      <ProductListingShell
        baseProducts={products}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/products", label: "Products" }
        ]}
        description="Browse the full FitSupplement catalog with rich filters, fast sorting, search suggestions, and mobile-friendly product cards."
        seoContent={{
          heading: "Supplement shopping made label-first",
          text: "Compare protein powders, creatine, mass gainers, vitamins, and wellness products by price, serving details, allergens, subscription availability, and lab-report access."
        }}
        title="Shop supplements"
      />
    </SiteShell>
  );
}
