import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import { storefrontProducts } from "@/mock/storefront";
import { breadcrumbSchema, buildSeoMetadata, faqSchema, productSchema } from "@/lib/seo/seo";
import {
  buildLiveProductDetailContent,
  getLiveRelatedProducts,
  getLiveStorefrontProductBySlug,
  getLiveStorefrontProducts
} from "@/lib/storefront/liveCatalog";
import { getProductBySlug, getProductDetailContent, getProductsByIds, getRelatedProducts } from "@/mock/storefront";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return storefrontProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = (await getLiveStorefrontProductBySlug(slug)) ?? getProductBySlug(slug);

  if (!product) {
    return {
      title: "Product not found"
    };
  }

  return buildSeoMetadata({
    canonicalPath: `/products/${product.slug}`,
    description: product.seoDescription ?? product.shortDescription,
    image: product.images[0]?.url,
    title: product.seoTitle ?? product.name
  });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const liveProduct = await getLiveStorefrontProductBySlug(slug);
  const product = liveProduct ?? getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const detail = liveProduct ? buildLiveProductDetailContent() : getProductDetailContent(product.id);

  if (!detail) {
    notFound();
  }
  const relatedProducts = liveProduct ? await getLiveRelatedProducts(product) : getRelatedProducts(product);
  const liveProducts = liveProduct ? await getLiveStorefrontProducts() : [];

  return (
    <SiteShell>
      <JsonLd data={productSchema(product)} />
      <JsonLd data={faqSchema(detail.faq)} />
      <JsonLd
        data={breadcrumbSchema([
          { href: "/", label: "Home" },
          { href: "/products", label: "Products" },
          { href: `/products/${product.slug}`, label: product.name }
        ])}
      />
      <ProductDetailClient
        compareProducts={liveProduct ? liveProducts.filter((item) => detail.compareProductIds.includes(item.id)) : getProductsByIds(detail.compareProductIds)}
        detail={detail}
        frequentlyBoughtTogether={liveProduct ? liveProducts.filter((item) => detail.frequentlyBoughtTogetherIds.includes(item.id)) : getProductsByIds(detail.frequentlyBoughtTogetherIds)}
        product={product}
        recommendedStack={liveProduct ? liveProducts.filter((item) => detail.recommendedStackIds.includes(item.id)) : getProductsByIds(detail.recommendedStackIds)}
        relatedProducts={relatedProducts}
      />
    </SiteShell>
  );
}
