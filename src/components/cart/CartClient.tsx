"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { storefrontProducts } from "@/mock/storefront";
import { bundleDeals } from "@/mock/promotions";
import type { AddToCartPayload, CartLineItem } from "@/types/cart";
import { applyCoupon, calculateCartTotals, formatRs } from "@/lib/cart/cartPricing";
import { useCart } from "@/lib/cart/useCart";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { CartSummaryCard } from "./CartSummaryCard";

type CartAddOn =
  | {
      cta: string;
      productId: string;
    }
  | {
      cta: string;
      description: string;
      imageUrl: string;
      payload: AddToCartPayload;
      title: string;
    };

const addOns: CartAddOn[] = [
  {
    cta: "Add shaker",
    description: "Leak-resistant 700 ml shaker for smooth mixing.",
    imageUrl: "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=500&q=80",
    payload: {
      addedAt: "",
      brandName: "FitSupplement",
      discountPercent: 10,
      imageUrl: "https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=500&q=80",
      mrp: 499,
      productId: "addon-shaker",
      productName: "FitSupplement Pro Shaker",
      productSlug: "pro-shaker",
      purchaseType: "one-time",
      quantity: 1,
      sku: "FS-SHAKER-700",
      unitPrice: 449,
      variantId: "addon-shaker-black",
      variantLabel: "Black / 700 ml"
    } satisfies AddToCartPayload,
    title: "Pro shaker"
  },
  {
    cta: "Add creatine",
    productId: "prod-creatine-mono"
  },
  {
    cta: "Add multivitamin",
    productId: "prod-daily-multi"
  }
];

export function CartClient() {
  const cart = useCart();
  const [couponInput, setCouponInput] = useState("");
  const [couponCode, setCouponCode] = useState<string | undefined>();
  const [couponMessage, setCouponMessage] = useState("");
  const enrichedItems = useMemo(() => cart.items.map(enrichCartItem), [cart.items]);
  const totals = useMemo(() => calculateCartTotals(enrichedItems, couponCode), [couponCode, enrichedItems]);

  function handleApplyCoupon() {
    const result = applyCoupon(enrichedItems, couponInput);
    setCouponMessage(result.message);
    setCouponCode(result.ok ? result.code : undefined);
  }

  function handleAddOn(addOn: (typeof addOns)[number]) {
    let payload: AddToCartPayload | null = null;

    if ("payload" in addOn) {
      payload = { ...addOn.payload, addedAt: new Date().toISOString() };
    } else {
      payload = createPayloadFromProduct(addOn.productId);
    }

    if (payload) {
      cart.addItem(payload);
    }
  }

  function addBundleToCart(bundleId: string) {
    const bundle = bundleDeals.find((deal) => deal.id === bundleId);
    if (!bundle) return;

    bundle.productIds.forEach((productId) => {
      const payload = createPayloadFromProduct(productId);
      if (payload) {
        cart.addItem({
          ...payload,
          bundleId: bundle.id,
          discountPercent: Math.max(payload.discountPercent ?? 0, 10)
        });
      }
    });
  }

  if (!cart.isReady) {
    return (
      <main className="container-page py-10">
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <Skeleton className="h-80" />
          <Skeleton className="h-80" />
        </div>
      </main>
    );
  }

  if (enrichedItems.length === 0) {
    return (
      <main className="container-page py-16">
        <EmptyState
          action={<Button href="/products" variant="dark">Start shopping</Button>}
          description="Add protein, creatine, wellness essentials, or accessories to build your stack."
          title="Your cart is empty"
        />
      </main>
    );
  }

  return (
    <main className="container-page py-8 lg:py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-card border border-black/10 bg-white p-5 shadow-sm">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">Cart</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Your supplement stack</h1>
          <p className="mt-2 text-sm leading-6 text-slate">Review flavors, purchase type, coupons, and delivery savings before checkout.</p>
        </div>
        <button className="focus-ring rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-black" onClick={cart.clearCart} type="button">
          Clear cart
        </button>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-4">
          {enrichedItems.map((item) => (
            <article className="grid gap-4 rounded-card border border-black/10 bg-white p-3 shadow-sm sm:grid-cols-[118px_1fr_auto]" key={item.lineId}>
              <Link className="overflow-hidden rounded-md bg-mist" href={`/products/${item.productSlug}`}>
                {item.imageUrl ? (
                  <Image alt={item.productName} className="aspect-square w-full object-cover" height={220} src={item.imageUrl} width={220} />
                ) : (
                  <div className="aspect-square" />
                )}
              </Link>
              <div className="min-w-0">
                <div className="flex flex-wrap gap-2">
                  {item.brandName ? <Badge tone="success">{item.brandName}</Badge> : null}
                  <Badge tone={item.purchaseType === "subscribe" ? "dark" : "neutral"}>
                    {item.purchaseType === "subscribe" ? `Subscribe ${item.subscriptionFrequency}` : "One-time"}
                  </Badge>
                </div>
                <Link href={`/products/${item.productSlug}`}>
                  <h2 className="mt-2 text-lg font-black text-ink">{item.productName}</h2>
                </Link>
                <p className="mt-1 text-sm font-semibold text-slate">{item.variantLabel ?? item.sku}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-lg font-black text-ink">{formatRs(item.unitPrice)}</span>
                  {item.mrp && item.mrp > item.unitPrice ? (
                    <span className="text-sm font-semibold text-slate line-through">{formatRs(item.mrp)}</span>
                  ) : null}
                  {item.discountPercent ? <Badge tone="sale">{item.discountPercent}% off</Badge> : null}
                </div>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <div className="inline-grid h-10 grid-cols-[40px_48px_40px] overflow-hidden rounded-md border border-black/10">
                  <button className="focus-ring flex items-center justify-center" onClick={() => cart.updateQuantity(item.lineId, item.quantity - 1)} type="button">
                    <Minus className="h-4 w-4" />
                  </button>
                  <output className="flex items-center justify-center text-sm font-black">{item.quantity}</output>
                  <button className="focus-ring flex items-center justify-center" onClick={() => cart.updateQuantity(item.lineId, item.quantity + 1)} type="button">
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <button className="focus-ring inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-bold text-coral" onClick={() => cart.removeItem(item.lineId)} type="button">
                  <Trash2 className="h-4 w-4" /> Remove
                </button>
              </div>
            </article>
          ))}

          <section className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-ink">Recommended add-ons</h2>
            <p className="mt-1 text-sm text-slate">Complete the stack with useful accessories and daily essentials.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {addOns.map((addOn) => {
                const product = "productId" in addOn ? storefrontProducts.find((item) => item.id === addOn.productId) : undefined;
                return (
                  <div className="rounded-md border border-black/10 p-3" key={"productId" in addOn ? addOn.productId : addOn.title}>
                    <p className="font-black text-ink">{"title" in addOn ? addOn.title : product?.name}</p>
                    <p className="mt-1 min-h-10 text-xs leading-5 text-slate">
                      {"description" in addOn ? addOn.description : product?.shortDescription}
                    </p>
                    <button className="focus-ring mt-3 w-full rounded-md bg-ink px-3 py-2 text-sm font-black text-white" onClick={() => handleAddOn(addOn)} type="button">
                      {addOn.cta}
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-ink">Bundle deals</h2>
            <p className="mt-1 text-sm text-slate">Add curated combinations in one tap and keep variant details in the cart.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {bundleDeals.map((bundle) => (
                <div className="rounded-md border border-black/10 p-4" key={bundle.id}>
                  <p className="font-black text-ink">{bundle.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate">{bundle.description}</p>
                  <p className="mt-2 text-sm font-black text-forest">
                    Bundle price {formatRs(bundle.bundlePrice)} - save {formatRs(bundle.discountAmount)}
                  </p>
                  <button className="focus-ring mt-3 w-full rounded-md bg-ink px-3 py-2 text-sm font-black text-white" onClick={() => addBundleToCart(bundle.id)} type="button">
                    Add full bundle to cart
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="lg:sticky lg:top-5 lg:self-start">
          <div className="mb-4 rounded-card border border-black/10 bg-white p-4 shadow-sm">
            <label className="text-sm font-black text-ink" htmlFor="coupon">
              Apply coupon
            </label>
            <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
              <input
                className="focus-ring h-11 rounded-md border border-black/10 px-3 text-sm font-semibold uppercase"
                id="coupon"
                onChange={(event) => setCouponInput(event.target.value)}
                placeholder="FIT300"
                value={couponInput}
              />
              <button className="focus-ring rounded-md bg-ink px-4 text-sm font-black text-white" onClick={handleApplyCoupon} type="button">
                Apply
              </button>
            </div>
            {couponMessage ? <p className="mt-2 text-xs font-bold text-forest">{couponMessage}</p> : null}
          </div>
          <CartSummaryCard
            action={<Button className="w-full" href="/checkout" size="lg" variant="dark">Proceed to checkout</Button>}
            items={enrichedItems}
            totals={totals}
          />
        </div>
      </section>
    </main>
  );
}

function createPayloadFromProduct(productId: string): AddToCartPayload | null {
  const product = storefrontProducts.find((item) => item.id === productId);
  const variant = product?.variants[0];

  if (!product || !variant) {
    return null;
  }

  return {
    addedAt: new Date().toISOString(),
    brandName: product.merchandising.brandName,
    categorySlug: product.merchandising.categorySlug,
    discountPercent: variant.discountPercent,
    imageUrl: product.images[0]?.url,
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
  };
}

function enrichCartItem(item: CartLineItem): CartLineItem {
  const product = storefrontProducts.find((candidate) => candidate.id === item.productId);
  const variant = product?.variants.find((candidate) => candidate.id === item.variantId);

  if (!product || !variant) {
    return item;
  }

  return {
    ...item,
    brandName: item.brandName ?? product.merchandising.brandName,
    categorySlug: item.categorySlug ?? product.merchandising.categorySlug,
    discountPercent: item.discountPercent ?? variant.discountPercent,
    imageUrl: item.imageUrl ?? product.images[0]?.url,
    mrp: item.mrp ?? variant.mrp,
    productSlug: product.slug,
    unitPrice: item.unitPrice ?? variant.sellingPrice,
    variantLabel: item.variantLabel ?? [variant.flavor, variant.size].filter(Boolean).join(" / ")
  };
}
