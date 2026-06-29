import type { Metadata } from "next";
import type { Product } from "@/types";

export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fitsupplement.example";
export const defaultOgImage = "/og/fitsupplement-store.svg";

type SeoInput = {
  canonicalPath: string;
  description: string;
  image?: string;
  noindex?: boolean;
  title: string;
};

export function buildSeoMetadata({ canonicalPath, description, image, noindex, title }: SeoInput): Metadata {
  const canonicalUrl = absoluteUrl(canonicalPath);
  const ogImage = absoluteUrl(image ?? defaultOgImage);

  return {
    alternates: {
      canonical: canonicalUrl
    },
    description,
    openGraph: {
      description,
      images: [ogImage],
      siteName: "FitSupplement Store",
      title,
      type: "website",
      url: canonicalUrl
    },
    robots: noindex ? { follow: false, index: false } : { follow: true, index: true },
    title,
    twitter: {
      card: "summary_large_image",
      description,
      images: [ogImage],
      title
    }
  };
}

export function absoluteUrl(path: string) {
  if (path.startsWith("http")) {
    return path;
  }

  return `${siteUrl}${path.startsWith("/") ? path : `/${path}`}`;
}

export function productSchema(product: Product) {
  const variant = product.variants[0];
  const image = product.images[0];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    brand: {
      "@type": "Brand",
      name: product.brandId
    },
    description: product.shortDescription,
    image: image ? absoluteUrl(image.url) : absoluteUrl(defaultOgImage),
    name: product.name,
    offers: variant
      ? {
          "@type": "Offer",
          availability: variant.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          price: variant.sellingPrice,
          priceCurrency: variant.currency,
          sku: variant.sku,
          url: absoluteUrl(`/products/${product.slug}`)
        }
      : undefined,
    sku: variant?.sku
  };
}

export function breadcrumbSchema(items: Array<{ href: string; label: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      item: absoluteUrl(item.href),
      name: item.label,
      position: index + 1
    }))
  };
}

export function faqSchema(items: Array<{ answer: string; question: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      },
      name: item.question
    }))
  };
}

export function collectionSchema(name: string, description: string, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    description,
    name,
    url: absoluteUrl(path)
  };
}
