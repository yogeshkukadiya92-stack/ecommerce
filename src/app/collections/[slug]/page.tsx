import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductListingShell } from "@/components/storefront/ProductListingShell";
import {
  collectionDefinitions,
  getCollectionBySlug,
  getProductsByCollection
} from "@/mock/storefront";
import { breadcrumbSchema, buildSeoMetadata, collectionSchema } from "@/lib/seo/seo";
import { getLiveStorefrontProductsByCollection } from "@/lib/storefront/liveCatalog";

type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return collectionDefinitions.map((collection) => ({ slug: collection.slug }));
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: "Collection not found"
    };
  }

  return buildSeoMetadata({
    canonicalPath: `/collections/${collection.slug}`,
    description: collection.description,
    title: collection.title
  });
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const liveProducts = await getLiveStorefrontProductsByCollection(slug);

  return (
    <SiteShell>
      <JsonLd data={collectionSchema(collection.title, collection.description, `/collections/${collection.slug}`)} />
      <JsonLd
        data={breadcrumbSchema([
          { href: "/", label: "Home" },
          { href: "/products", label: "Products" },
          { href: `/collections/${collection.slug}`, label: collection.title }
        ])}
      />
      <ProductListingShell
        baseProducts={liveProducts.length > 0 ? liveProducts : getProductsByCollection(slug)}
        breadcrumbs={[
          { href: "/", label: "Home" },
          { href: "/products", label: "Products" },
          { href: `/collections/${collection.slug}`, label: collection.title }
        ]}
        description={collection.description}
        seoContent={{
          heading: `${collection.title} supplement picks`,
          text: `${collection.description} Products are grouped for discovery and comparison, with clear supplement warnings and label-first shopping information.`
        }}
        title={collection.title}
      />
    </SiteShell>
  );
}
