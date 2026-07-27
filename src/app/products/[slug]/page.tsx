import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { ProductDetailClient } from "@/components/storefront/ProductDetailClient";
import { breadcrumbSchema, buildSeoMetadata, faqSchema, productSchema } from "@/lib/seo/seo";
import {
  buildLiveProductDetailContent,
  canUseLiveStorefrontCatalog,
  getLiveRelatedProducts,
  getLiveStorefrontProductBySlug,
  getLiveStorefrontProducts
} from "@/lib/storefront/liveCatalog";

export const dynamic = "force-dynamic";

type ProductDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getLiveStorefrontProductBySlug(slug);

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
  const usesLiveCatalog = canUseLiveStorefrontCatalog();
  const product = await getLiveStorefrontProductBySlug(slug);

  if (!product) {
    notFound();
  }

  if (!usesLiveCatalog) {
    const { getProductDetailContent, getProductsByIds, getRelatedProducts } = await import("@/mock/storefront");
    const detail = getProductDetailContent(product.id);

    if (!detail) {
      notFound();
    }

    return renderProductPage({
      compareProducts: getProductsByIds(detail.compareProductIds),
      detail,
      frequentlyBoughtTogether: getProductsByIds(detail.frequentlyBoughtTogetherIds),
      product,
      recommendedStack: getProductsByIds(detail.recommendedStackIds),
      relatedProducts: getRelatedProducts(product)
    });
  }

  const detail = buildLiveProductDetailContent();
  const [relatedProducts, liveProducts] = await Promise.all([
    getLiveRelatedProducts(product),
    getLiveStorefrontProducts()
  ]);

  return renderProductPage({
    compareProducts: liveProducts.filter((item) => detail.compareProductIds.includes(item.id)),
    detail,
    frequentlyBoughtTogether: liveProducts.filter((item) => detail.frequentlyBoughtTogetherIds.includes(item.id)),
    product,
    recommendedStack: liveProducts.filter((item) => detail.recommendedStackIds.includes(item.id)),
    relatedProducts
  });
}

function renderProductPage({
  compareProducts,
  detail,
  frequentlyBoughtTogether,
  product,
  recommendedStack,
  relatedProducts
}: {
  compareProducts: Parameters<typeof ProductDetailClient>[0]["compareProducts"];
  detail: Parameters<typeof ProductDetailClient>[0]["detail"];
  frequentlyBoughtTogether: Parameters<typeof ProductDetailClient>[0]["frequentlyBoughtTogether"];
  product: Parameters<typeof ProductDetailClient>[0]["product"];
  recommendedStack: Parameters<typeof ProductDetailClient>[0]["recommendedStack"];
  relatedProducts: Parameters<typeof ProductDetailClient>[0]["relatedProducts"];
}) {

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
        compareProducts={compareProducts}
        detail={detail}
        frequentlyBoughtTogether={frequentlyBoughtTogether}
        product={product}
        recommendedStack={recommendedStack}
        relatedProducts={relatedProducts}
      />
    </SiteShell>
  );
}
