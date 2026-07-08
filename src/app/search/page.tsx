import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductListingShell } from "@/components/storefront/ProductListingShell";
import { breadcrumbSchema, buildSeoMetadata } from "@/lib/seo/seo";
import { getLiveStorefrontProducts } from "@/lib/storefront/liveCatalog";

export const metadata: Metadata = buildSeoMetadata({
  canonicalPath: "/search",
  description: "Search protein powders, creatine, vitamins, health supplements, and fitness accessories.",
  title: "Search Supplements"
});

export default async function SearchPage() {
  const products = await getLiveStorefrontProducts();

  return (
    <SiteShell>
      <JsonLd data={breadcrumbSchema([{ href: "/", label: "Home" }, { href: "/search", label: "Search" }])} />
      <ProductListingShell
        baseProducts={products}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/search", label: "Search" }
        ]}
        description="Search the catalog with suggestions, popular terms, filters, and no-result recommendations."
        seoContent={{
          heading: "Search supplement products clearly",
          text: "Search across protein powders, creatine, vitamins, accessories, flavors, goals, and label-first supplement details with clear filters and recommendations."
        }}
        title="Search results"
      />
    </SiteShell>
  );
}
