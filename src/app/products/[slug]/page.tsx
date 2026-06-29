import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import {
  getProductBySlug,
  getProductDetailContent,
  getProductsByIds,
  getRelatedProducts,
  storefrontProducts
} from "@/mock/storefront";
import { breadcrumbSchema, buildSeoMetadata, faqSchema, productSchema } from "@/lib/seo/seo";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return storefrontProducts.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);

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
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const detail = getProductDetailContent(product.id);

  if (!detail) {
    notFound();
  }

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
        compareProducts={getProductsByIds(detail.compareProductIds)}
        detail={detail}
        frequentlyBoughtTogether={getProductsByIds(detail.frequentlyBoughtTogetherIds)}
        product={product}
        recommendedStack={getProductsByIds(detail.recommendedStackIds)}
        relatedProducts={getRelatedProducts(product)}
      />
    </SiteShell>
  );
}
