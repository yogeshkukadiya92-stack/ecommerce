import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductListingShell } from "@/components/storefront/ProductListingShell";
import { getCategoryBySlug } from "@/mock/storefront";
import { breadcrumbSchema, buildSeoMetadata, collectionSchema } from "@/lib/seo/seo";
import { getLiveStorefrontProductsByCategory } from "@/lib/storefront/liveCatalog";

export const dynamic = "force-dynamic";

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const { categories } = await import("@/mock/categories");
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {
      title: "Category not found"
    };
  }

  return buildSeoMetadata({
    canonicalPath: `/categories/${category.slug}`,
    description: category.description,
    image: category.imageUrl,
    title: category.name
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const liveProducts = await getLiveStorefrontProductsByCategory(slug);

  return (
    <SiteShell>
      <JsonLd data={collectionSchema(category.name, category.description, `/categories/${category.slug}`)} />
      <JsonLd
        data={breadcrumbSchema([
          { href: "/", label: "Home" },
          { href: "/products", label: "Products" },
          { href: `/categories/${category.slug}`, label: category.name }
        ])}
      />
      <ProductListingShell
        baseProducts={liveProducts}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/products", label: "Products" },
          { href: `/categories/${category.slug}`, label: category.name }
        ]}
        description={category.description}
        seoContent={{
          heading: `${category.name} buying guide`,
          text: `${category.description} Compare labels, serving details, allergen declarations, pricing, and batch transparency before choosing a supplement.`
        }}
        title={category.name}
      />
    </SiteShell>
  );
}
