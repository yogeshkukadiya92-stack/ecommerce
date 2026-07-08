import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductListingShell } from "@/components/storefront/ProductListingShell";
import { getBrandBySlug } from "@/mock/storefront";
import { breadcrumbSchema, buildSeoMetadata, collectionSchema } from "@/lib/seo/seo";
import { getLiveStorefrontProductsByBrand } from "@/lib/storefront/liveCatalog";

export const dynamic = "force-dynamic";

type BrandPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { brands } = await import("@/mock/brands");
  return brands.map((brand) => ({ slug: brand.slug }));
}

export async function generateMetadata({ params }: BrandPageProps): Promise<Metadata> {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) {
    return {
      title: "Brand not found"
    };
  }

  return buildSeoMetadata({
    canonicalPath: `/brands/${brand.slug}`,
    description: brand.description,
    image: brand.logoUrl,
    title: `${brand.name} Supplements`
  });
}

export default async function BrandPage({ params }: BrandPageProps) {
  const { slug } = await params;
  const brand = getBrandBySlug(slug);

  if (!brand) {
    notFound();
  }

  const liveProducts = await getLiveStorefrontProductsByBrand(slug);

  return (
    <SiteShell>
      <JsonLd data={collectionSchema(`${brand.name} supplements`, brand.description, `/brands/${brand.slug}`)} />
      <JsonLd
        data={breadcrumbSchema([
          { href: "/", label: "Home" },
          { href: "/products", label: "Products" },
          { href: `/brands/${brand.slug}`, label: brand.name }
        ])}
      />
      <ProductListingShell
        baseProducts={liveProducts}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/products", label: "Products" },
          { href: `/brands/${brand.slug}`, label: brand.name }
        ]}
        description={brand.description}
        seoContent={{
          heading: `${brand.name} supplement range`,
          text: `${brand.description} Review product labels, batch details, lab-report availability, and pricing before adding products to your routine.`
        }}
        title={`${brand.name} supplements`}
      />
    </SiteShell>
  );
}
