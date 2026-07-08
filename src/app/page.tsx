import type { Metadata } from "next";
import { CmsHomepageRuntime } from "@/components/cms/CmsHomepageRuntime";
import { SiteShell } from "@/components/layout/SiteShell";
import { StickyMobileCTA } from "@/components/storefront/StickyMobileCTA";
import { getPublishedHomepageSections, getWebsiteStudioData } from "@/lib/cms/cmsRepository";
import { buildSeoMetadata } from "@/lib/seo/seo";
import { getLiveStorefrontProducts } from "@/lib/storefront/liveCatalog";

export const dynamic = "force-dynamic";

export function generateMetadata(): Metadata {
  const seo = getWebsiteStudioData().seo.find((entry) => entry.pageKey === "homepage");

  return buildSeoMetadata({
    canonicalPath: seo?.canonicalUrl ?? "/",
    description:
      seo?.metaDescription ??
      "Shop premium protein powders, creatine, vitamins, wellness supplements, shakers, and fitness accessories.",
    image: seo?.ogImageUrl,
    noindex: seo?.noindex,
    title: seo?.title ?? "FitSupplement Store"
  });
}

export default async function HomePage() {
  const sections = getPublishedHomepageSections();
  const products = await getLiveStorefrontProducts();

  return (
    <SiteShell>
      <main>
        <CmsHomepageRuntime products={products} sections={sections} />
        <StickyMobileCTA />
      </main>
    </SiteShell>
  );
}
