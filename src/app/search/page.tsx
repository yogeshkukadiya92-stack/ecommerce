import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductListingShell } from "@/components/storefront/ProductListingShell";
import { storefrontProducts } from "@/mock/storefront";
import { breadcrumbSchema, buildSeoMetadata } from "@/lib/seo/seo";

export const metadata: Metadata = buildSeoMetadata({
  canonicalPath: "/search",
  description: "Search protein powders, creatine, vitamins, health supplements, and fitness accessories.",
  title: "Search Supplements"
});

export default function SearchPage() {
  return (
    <SiteShell>
      <JsonLd data={breadcrumbSchema([{ href: "/", label: "Home" }, { href: "/search", label: "Search" }])} />
      <ProductListingShell
        baseProducts={storefrontProducts}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/search", label: "Search" }
        ]}
        description="Search the catalog with suggestions, popular terms, filters, and no-result recommendations."
        seoContent={{
          heading: "Search supplement products clearly",
          text: "Search results use clean query parameters and can later connect to advanced ranking, no-result term tracking, and recommended product mappings."
        }}
        title="Search results"
      />
    </SiteShell>
  );
}
