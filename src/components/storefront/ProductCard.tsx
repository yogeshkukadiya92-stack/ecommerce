"use client";

import Image from "next/image";
import Link from "next/link";
import { Beaker, GitCompare, Heart, ShieldCheck, ShoppingCart } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/types";
import type { StorefrontProduct } from "@/mock/storefront";
import { addLocalCartItem } from "@/lib/cart/localCart";
import { Badge } from "@/components/ui/Badge";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { RatingStars } from "@/components/ui/RatingStars";

type ProductCardProduct = Product | StorefrontProduct;

function hasMerchandising(product: ProductCardProduct): product is StorefrontProduct {
  return "merchandising" in product;
}

export function ProductCard({ product }: { product: ProductCardProduct }) {
  const [message, setMessage] = useState("");
  const variant = product.variants[0];
  const image = product.images[0];
  const merchandising = hasMerchandising(product) ? product.merchandising : undefined;
  const stockTone = variant?.stock && variant.stock > 15 ? "success" : "sale";
  const [isCompared, setIsCompared] = useState(false);

  function handleQuickAdd() {
    if (!variant) {
      return;
    }

    addLocalCartItem({
      addedAt: new Date().toISOString(),
      brandName: merchandising?.brandName,
      discountPercent: variant.discountPercent,
      imageUrl: image?.url,
      mrp: variant.mrp,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      purchaseType: "one-time",
      quantity: 1,
      sku: variant.sku,
      unitPrice: variant.sellingPrice,
      variantId: variant.id,
      variantLabel: [variant.flavor, variant.size].filter(Boolean).join(" / ")
    });
    setMessage("Added to cart");
  }

  return (
    <article className="group flex h-full min-w-0 flex-col rounded-card border border-black/10 bg-white p-2 shadow-sm transition duration-200 hover:-translate-y-1 hover:border-forest/30 hover:shadow-card">
      <div className="relative overflow-hidden rounded-md bg-mist">
        {image ? (
          <Image
            alt={image.altText}
            className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
            height={420}
            loading="lazy"
            sizes="(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 280px"
            src={image.url}
            width={420}
          />
        ) : (
          <div className="grid aspect-square place-items-center text-xs font-black uppercase tracking-[0.12em] text-slate">No image</div>
        )}
        <button
          className="focus-ring absolute right-3 top-3 rounded-md border border-black/10 bg-white/95 p-2 text-slate shadow-sm backdrop-blur transition hover:text-coral"
          type="button"
        >
          <Heart className="h-4 w-4" />
          <span className="sr-only">Add to wishlist</span>
        </button>
        <button
          className="focus-ring absolute bottom-3 right-3 rounded-md border border-black/10 bg-white/95 p-2 text-slate shadow-sm backdrop-blur transition hover:text-forest"
          onClick={() => setIsCompared((current) => !current)}
          type="button"
        >
          <GitCompare className="h-4 w-4" />
          <span className="sr-only">Compare product</span>
        </button>
        {variant?.discountPercent ? (
          <div className="absolute left-3 top-3">
            <Badge tone="sale">{variant.discountPercent}% off</Badge>
          </div>
        ) : null}
      </div>
      <div className="flex min-w-0 flex-1 flex-col p-2.5">
        <div className="mt-2 flex min-h-8 flex-wrap gap-1">
          {product.goalTags.slice(0, 2).map((tag) => (
            <Badge key={tag} tone="success">
              {tag}
            </Badge>
          ))}
          {variant ? <Badge tone={stockTone}>{variant.stock > 0 ? "In stock" : "Out"}</Badge> : null}
        </div>
        {merchandising ? (
          <p className="mt-3 text-xs font-extrabold uppercase tracking-[0.1em] text-forest">
            {merchandising.brandName}
          </p>
        ) : null}
        <Link href={`/products/${product.slug}`}>
          <h3 className="mt-2 line-clamp-2 min-h-11 text-[15px] font-extrabold leading-5 text-ink sm:text-base sm:leading-6">
            {product.name}
          </h3>
        </Link>
        <p className="mt-1 line-clamp-2 min-h-10 text-xs leading-5 text-slate sm:text-sm">
          {product.shortDescription}
        </p>
        <div className="mt-3">
          <RatingStars rating={merchandising?.rating ?? 4.7} reviewCount={merchandising?.reviewCount ?? 128} />
        </div>
        {variant ? (
          <div className="mt-3 rounded-md border border-black/10 bg-white px-3 py-2 shadow-[inset_0_1px_0_rgba(17,19,21,0.03)]">
            <PriceDisplay mrp={variant.mrp} sellingPrice={variant.sellingPrice} />
          </div>
        ) : null}
        {merchandising ? (
          <div className="mt-3 grid gap-2 rounded-md border border-black/5 bg-mist p-3 text-xs font-semibold text-slate">
            <div className="flex items-center justify-between gap-2">
              <span>Per serving</span>
              <span className="font-extrabold text-ink">Rs {merchandising.pricePerServing}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Protein</span>
              <span className="font-extrabold text-ink">{merchandising.proteinPerServing} g</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span>Preview</span>
              <span className="min-w-0 max-w-24 truncate text-right font-extrabold text-ink sm:max-w-36">
                {[merchandising.flavors[0], merchandising.sizes[0]].filter(Boolean).join(" / ")}
              </span>
            </div>
          </div>
        ) : null}
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-forest">
          <span className="inline-flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5" /> Authentic
          </span>
          {product.labReportUrl ? (
            <span className="inline-flex items-center gap-1">
              <Beaker className="h-3.5 w-3.5" /> Lab report
            </span>
          ) : null}
        </div>
        {isCompared ? <p className="mt-2 text-xs font-bold text-forest">Added to compare</p> : null}
        <button
          className="focus-ring mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-md bg-ink text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-forest hover:shadow-card active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={!variant || variant.stock <= 0}
          onClick={handleQuickAdd}
          type="button"
        >
          <ShoppingCart className="h-4 w-4" /> {variant && variant.stock > 0 ? "Add to cart" : "Out of stock"}
        </button>
        {message ? <p aria-live="polite" className="mt-2 text-center text-xs font-bold text-forest">{message}</p> : null}
      </div>
    </article>
  );
}
