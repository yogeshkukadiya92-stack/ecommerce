"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Beaker,
  ChevronRight,
  Heart,
  Minus,
  PackageCheck,
  Plus,
  ShieldCheck,
  ShoppingCart,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ProductVariant } from "@/types";
import type { AddToCartPayload, PurchaseType, SubscriptionFrequency } from "@/types/cart";
import type { ProductDetailContent, StorefrontProduct } from "@/mock/storefront";
import { productQuestions, productReviews } from "@/mock/engagement";
import { bundleDeals } from "@/mock/promotions";
import { addLocalCartItem } from "@/lib/cart/localCart";
import { formatRs } from "@/lib/cart/cartPricing";
import { getReviewSummary } from "@/lib/engagement/engagementService";
import { Accordion } from "@/components/ui/Accordion";
import { Badge } from "@/components/ui/Badge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PriceDisplay } from "@/components/ui/PriceDisplay";
import { RatingStars } from "@/components/ui/RatingStars";
import { ProductCard } from "./ProductCard";

type ProductDetailClientProps = {
  compareProducts: StorefrontProduct[];
  detail: ProductDetailContent;
  frequentlyBoughtTogether: StorefrontProduct[];
  product: StorefrontProduct;
  recommendedStack: StorefrontProduct[];
  relatedProducts: StorefrontProduct[];
};

const subscriptionFrequencies: SubscriptionFrequency[] = ["15 days", "30 days", "45 days", "60 days"];

const disclaimer =
  "This product is not intended to diagnose, treat, cure, or prevent any disease. Consult a qualified professional before use if pregnant, nursing, under medication, or having a medical condition.";

export function ProductDetailClient({
  compareProducts,
  detail,
  frequentlyBoughtTogether,
  product,
  recommendedStack,
  relatedProducts
}: ProductDetailClientProps) {
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? "");
  const [selectedGalleryIndex, setSelectedGalleryIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState("");
  const [purchaseType, setPurchaseType] = useState<PurchaseType>("one-time");
  const [subscriptionFrequency, setSubscriptionFrequency] =
    useState<SubscriptionFrequency>("30 days");
  const [cartMessage, setCartMessage] = useState("");
  const [alertMessage, setAlertMessage] = useState("");

  const selectedVariant =
    product.variants.find((variant) => variant.id === selectedVariantId) ?? product.variants[0];

  const galleryItems = useMemo(
    () => [
      ...product.images.map((image, index) => ({
        alt: image.altText || `${product.name} photo ${index + 1}`,
        label: index === 0 ? "Main" : `Photo ${index + 1}`,
        type: "image" as const,
        url: image.url
      })),
      {
        alt: `${product.name} product label`,
        label: "Label",
        type: "panel" as const,
        value: "Label preview"
      },
      {
        alt: `${product.name} nutrition label`,
        label: "Nutrition",
        type: "nutrition" as const,
        value: "Nutrition label"
      },
      {
        alt: `${product.name} ingredients`,
        label: "Ingredients",
        type: "ingredients" as const,
        value: "Ingredient image"
      },
      {
        alt: `${product.name} video`,
        label: "Video",
        type: "video" as const,
        value: detail.videoUrl ?? "Product routine guide"
      }
    ],
    [detail.videoUrl, product.images, product.name]
  );

  const selectedGalleryItem = galleryItems[selectedGalleryIndex] ?? galleryItems[0];
  const flavorOptions = unique(product.variants.map((variant) => variant.flavor).filter(Boolean));
  const sizeOptions = unique(product.variants.map((variant) => variant.size).filter(Boolean));
  const pincodeReady = /^[1-9][0-9]{5}$/.test(pincode);

  function chooseVariant(partial: Pick<ProductVariant, "flavor" | "size">) {
    const match =
      product.variants.find(
        (variant) =>
          (partial.flavor ? variant.flavor === partial.flavor : true) &&
          (partial.size ? variant.size === partial.size : true)
      ) ??
      product.variants.find((variant) =>
        partial.flavor ? variant.flavor === partial.flavor : variant.size === partial.size
      );

    if (match) {
      setSelectedVariantId(match.id);
      setSelectedGalleryIndex(0);
    }
  }

  function createCartPayload(): AddToCartPayload {
    return {
      addedAt: new Date().toISOString(),
      brandName: product.merchandising.brandName,
      categorySlug: product.merchandising.categorySlug,
      discountPercent: selectedVariant.discountPercent,
      imageUrl: product.images[0]?.url,
      mrp: selectedVariant.mrp,
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      purchaseType,
      quantity,
      sku: selectedVariant.sku,
      subscriptionFrequency: purchaseType === "subscribe" ? subscriptionFrequency : undefined,
      unitPrice: selectedVariant.sellingPrice,
      variantLabel: [selectedVariant.flavor, selectedVariant.size].filter(Boolean).join(" / "),
      variantId: selectedVariant.id
    };
  }

  function handleAddToCart() {
    const payload = createCartPayload();
    addLocalCartItem(payload);
    setCartMessage(
      `${payload.sku} added: ${payload.quantity} x ${payload.purchaseType}${
        payload.subscriptionFrequency ? ` every ${payload.subscriptionFrequency}` : ""
      }`
    );
  }

  return (
    <main className="container-page pb-20 pt-8 lg:pb-16">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/products", label: "Products" },
          { href: `/products/${product.slug}`, label: product.name }
        ]}
      />

      <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] xl:grid-cols-[minmax(0,1fr)_480px]">
        <div className="grid gap-4 lg:grid-cols-[88px_minmax(0,1fr)]">
          <div className="order-2 grid grid-cols-5 gap-2 lg:order-1 lg:grid-cols-1 lg:auto-rows-[72px] lg:content-start">
            {galleryItems.map((item, index) => (
              <button
                className={`focus-ring min-h-14 rounded-md border bg-white p-2 text-xs font-black lg:h-[72px] ${
                  selectedGalleryIndex === index ? "border-forest text-forest" : "border-black/10 text-slate"
                }`}
                key={item.label}
                onClick={() => setSelectedGalleryIndex(index)}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="order-1 overflow-hidden rounded-card border border-black/10 bg-white p-3 shadow-soft lg:order-2">
            {selectedGalleryItem.type === "image" && selectedGalleryItem.url ? (
              <Image
                alt={selectedGalleryItem.alt}
                className="aspect-square w-full rounded-md bg-mist object-cover"
                height={780}
                priority
                sizes="(max-width: 1024px) 100vw, 60vw"
                src={selectedGalleryItem.url}
                width={780}
              />
            ) : (
              <GalleryPanel item={selectedGalleryItem} product={product} />
            )}
          </div>
        </div>

        <aside className="rounded-card border border-black/10 bg-white p-5 shadow-card">
          <div className="flex flex-wrap gap-2">
            <Badge tone="success">Verified authentic</Badge>
            <Badge tone="dark">Not for medicinal use</Badge>
          </div>
          <p className="mt-4 text-xs font-black uppercase tracking-[0.14em] text-forest">
            {product.merchandising.brandName}
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">{product.name}</h1>
          <p className="mt-3 text-sm leading-6 text-slate">{product.shortDescription}</p>
          <div className="mt-4 flex items-center gap-3">
            <RatingStars
              rating={product.merchandising.rating}
              reviewCount={product.merchandising.reviewCount}
            />
            <span className="text-xs font-bold text-slate">SKU {selectedVariant.sku}</span>
          </div>

          <div className="mt-5 rounded-md border border-black/10 bg-mist p-4" data-testid="pdp-price">
            <PriceDisplay mrp={selectedVariant.mrp} sellingPrice={selectedVariant.sellingPrice} />
            <p className="mt-2 text-xs font-semibold text-slate">
              Inclusive of taxes. Shipping calculated at checkout.
            </p>
            <p className="mt-2 text-sm font-black text-forest">
              Rs {product.merchandising.pricePerServing} per serving
            </p>
            {purchaseType === "subscribe" ? (
              <p className="mt-2 rounded-md bg-mint px-3 py-2 text-xs font-black text-forest">
                Subscribe & Save: extra 10% discount applies in cart and checkout.
              </p>
            ) : null}
          </div>

          <div className="mt-5 grid gap-4">
            <OptionGroup
              label="Flavor"
              onSelect={(value) => chooseVariant({ flavor: value, size: selectedVariant.size })}
              options={flavorOptions}
              selected={selectedVariant.flavor ?? ""}
            />
            <OptionGroup
              label="Size / weight"
              onSelect={(value) => chooseVariant({ flavor: selectedVariant.flavor, size: value })}
              options={sizeOptions}
              selected={selectedVariant.size ?? ""}
            />
            <div>
              <p className="mb-2 text-sm font-black text-ink">Quantity</p>
              <div className="inline-grid h-11 grid-cols-[44px_54px_44px] overflow-hidden rounded-md border border-black/10 bg-white">
                <button
                  className="focus-ring flex items-center justify-center text-slate hover:bg-mist"
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  type="button"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <output className="flex items-center justify-center text-sm font-black text-ink">
                  {quantity}
                </output>
                <button
                  className="focus-ring flex items-center justify-center text-slate hover:bg-mist"
                  onClick={() => setQuantity((value) => Math.min(10, value + 1))}
                  type="button"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="rounded-md border border-black/10 p-3">
              <p className="flex items-center gap-2 text-sm font-black text-forest">
                <PackageCheck className="h-4 w-4" />
                {selectedVariant.stock > 0 ? `${selectedVariant.stock} in stock` : "Out of stock"}
              </p>
              <p className="mt-1 text-xs text-slate">
                Batch {detail.authenticity.batchNumberExample} | Expiry {detail.authenticity.expiryExample}
              </p>
            </div>
            <div className="rounded-md border border-black/10 p-3">
              <label className="text-sm font-black text-ink" htmlFor="pincode">
                Delivery checker
              </label>
              <div className="mt-2 grid grid-cols-[1fr_auto] gap-2">
                <input
                  className="focus-ring h-11 rounded-md border border-black/10 px-3 text-sm font-semibold"
                  id="pincode"
                  inputMode="numeric"
                  maxLength={6}
                  onChange={(event) => setPincode(event.target.value.replace(/\D/g, ""))}
                  placeholder="Enter pincode"
                  value={pincode}
                />
                <button className="focus-ring rounded-md bg-ink px-4 text-sm font-black text-white" type="button">
                  Check
                </button>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate">
                {pincodeReady
                  ? "Estimated delivery in 2-5 days. Cashless payment supported."
                  : "Enter a 6-digit pincode to check estimated delivery."}
              </p>
            </div>
            <PurchaseTypeSelector
              frequency={subscriptionFrequency}
              isSubscriptionAvailable={product.merchandising.isSubscriptionAvailable}
              onFrequencyChange={setSubscriptionFrequency}
              onPurchaseTypeChange={setPurchaseType}
              purchaseType={purchaseType}
            />
            <div className="rounded-md border border-black/10 p-3">
              <p className="text-sm font-black text-ink">Stock and price alerts</p>
              <p className="mt-1 text-xs font-semibold text-slate">
                Get notified when this flavor is restocked or price drops.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <button
                  className="focus-ring rounded-md bg-mist px-3 py-2 text-xs font-black text-ink"
                  onClick={() => setAlertMessage("Back-in-stock alert saved.")}
                  type="button"
                >
                  Back-in-stock signup
                </button>
                <button
                  className="focus-ring rounded-md bg-mist px-3 py-2 text-xs font-black text-ink"
                  onClick={() => setAlertMessage("Price-drop alert saved.")}
                  type="button"
                >
                  Price-drop signup
                </button>
              </div>
              {alertMessage ? (
                <p className="mt-3 rounded-md bg-mint p-2 text-xs font-bold text-forest">{alertMessage}</p>
              ) : null}
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
            <button
              aria-label={`Add ${product.name} ${selectedVariant.flavor} ${selectedVariant.size} to cart`}
              className="focus-ring h-12 rounded-md bg-ink text-sm font-semibold text-white shadow-sm hover:bg-forest"
              onClick={handleAddToCart}
              type="button"
            >
              Add to cart
            </button>
            <button
              aria-label={`Buy ${product.name} ${selectedVariant.flavor} ${selectedVariant.size} now`}
              className="focus-ring h-12 rounded-md bg-lime text-sm font-semibold text-ink shadow-sm hover:bg-mint"
              onClick={handleAddToCart}
              type="button"
            >
              Buy now
            </button>
            <button className="focus-ring h-12 rounded-md border border-black/10 px-4 text-ink" type="button">
              <Heart className="mx-auto h-5 w-5" />
              <span className="sr-only">Wishlist</span>
            </button>
          </div>
          {cartMessage ? (
            <p className="mt-3 rounded-md bg-mint p-3 text-xs font-bold text-forest">{cartMessage}</p>
          ) : null}
        </aside>
      </section>

      <section className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <Highlight label="Protein" value={`${product.merchandising.proteinPerServing} g`} />
        <Highlight label="Calories" value={nutritionValue(product, "Calories") ?? "Varies"} />
        <Highlight label="Servings" value={String(product.merchandising.servingsCount)} />
        <Highlight label="Goal" value={product.goalTags[0] ?? "Wellness"} />
        <Highlight label="Type" value={product.merchandising.dietaryType} />
        <Highlight label="Sugar" value={product.merchandising.isSugarFree ? "Sugar-free" : "See label"} />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-6">
          <DetailCard title="Nutrition facts">
            <div className="overflow-hidden rounded-md border border-black/10">
              <table className="min-w-full text-left text-sm">
                <tbody className="divide-y divide-black/10">
                  {product.nutritionFacts.map((fact) => (
                    <tr key={fact.name}>
                      <th className="bg-mist px-4 py-3 font-black text-ink">{fact.name}</th>
                      <td className="px-4 py-3 text-slate">{fact.amount}</td>
                      <td className="px-4 py-3 text-slate">
                        {fact.dailyValuePercent ? `${fact.dailyValuePercent}% DV` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailCard>

          <DetailCard title="Ingredients">
            <p className="text-sm leading-6 text-slate">{product.ingredients.join(", ")}.</p>
          </DetailCard>

          <DetailCard title="Allergen information">
            <p className="text-sm leading-6 text-slate">
              {product.allergens.length > 0
                ? `Contains: ${product.allergens.join(", ")}.`
                : "No declared allergens in the sample data."}
            </p>
          </DetailCard>

          <DetailCard title="How to use">
            <p className="text-sm leading-6 text-slate">{product.usageInstructions}</p>
          </DetailCard>

          <DetailCard title="Warnings and disclaimer">
            <p className="text-sm font-bold leading-6 text-coral">Not for medicinal use.</p>
            <p className="mt-2 text-sm leading-6 text-slate">{product.warningText}</p>
            <p className="mt-2 text-sm leading-6 text-slate">{disclaimer}</p>
          </DetailCard>

          <DetailCard title="Storage instructions">
            <p className="text-sm leading-6 text-slate">{detail.storageInstructions}</p>
          </DetailCard>
        </div>

        <div className="grid content-start gap-6">
          <DetailCard title="Authenticity">
            <div className="grid gap-3 text-sm text-slate">
              <p className="flex items-center gap-2 font-bold text-forest">
                <ShieldCheck className="h-4 w-4" /> Verified authentic product
              </p>
              <p>Batch number example: {detail.authenticity.batchNumberExample}</p>
              <p>Expiry visible: {detail.authenticity.expiryExample}</p>
              <p>QR verification supports batch-level authenticity checks.</p>
              <p>Serial verification helps confirm label and batch details.</p>
              {product.labReportUrl ? (
                <Link
                  className="focus-ring inline-flex h-11 items-center justify-center gap-2 rounded-md bg-ink px-4 text-sm font-black text-white"
                  href={product.labReportUrl}
                >
                  <Beaker className="h-4 w-4" /> Download COA / lab report
                </Link>
              ) : null}
            </div>
          </DetailCard>

          <DetailCard title="Frequently bought together">
            <StackLinks products={frequentlyBoughtTogether} />
          </DetailCard>

          <DetailCard title="Recommended stack">
            <StackLinks products={recommendedStack} />
            <div className="mt-3 grid gap-2 text-xs font-bold text-slate">
              <span>Protein + creatine</span>
              <span>Protein + shaker</span>
            </div>
          </DetailCard>

          <DetailCard title="Bundle deals">
            <div className="grid gap-3">
              {bundleDeals
                .filter((bundle) => bundle.productIds.includes(product.id))
                .map((bundle) => (
                  <div className="rounded-md border border-black/10 p-3" key={bundle.id}>
                    <p className="font-black text-ink">{bundle.title}</p>
                    <p className="mt-1 text-sm text-slate">{bundle.description}</p>
                    <p className="mt-2 text-sm font-black text-forest">
                      {formatRs(bundle.bundlePrice)} bundle - save {formatRs(bundle.discountAmount)}
                    </p>
                    <Link className="mt-3 inline-flex text-sm font-black text-forest" href="/cart">
                      Build this bundle
                    </Link>
                  </div>
                ))}
            </div>
          </DetailCard>
        </div>
      </section>

      <ProductRail products={compareProducts} title="Compare with similar products" />

      <ReviewsSection product={product} />

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <QAndASection product={product} />

        <DetailCard title="Frequently asked questions">
          <Accordion items={detail.faq.map((item) => ({ title: item.question, content: item.answer }))} />
        </DetailCard>
      </section>

      <ProductRail products={relatedProducts} title="Related products" />

      <div
        className="fixed inset-x-0 bottom-16 z-40 border-t border-black/10 bg-white/95 p-3 shadow-2xl backdrop-blur lg:hidden"
        data-testid="mobile-sticky-cta"
      >
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="min-w-0 truncate text-xs font-bold text-slate">{selectedVariant.flavor} / {selectedVariant.size}</span>
          <span className="text-sm font-extrabold text-ink">{formatRs(selectedVariant.sellingPrice)}</span>
        </div>
        <div className="grid grid-cols-[1fr_1fr] gap-2">
          <button
            aria-label={`Add ${product.name} ${selectedVariant.flavor} ${selectedVariant.size} to cart from sticky bar`}
            className="focus-ring flex h-12 items-center justify-center gap-2 rounded-md bg-ink text-sm font-semibold text-white"
            onClick={handleAddToCart}
            type="button"
          >
            <ShoppingCart className="h-4 w-4" /> Add to cart
          </button>
          <button
            aria-label={`Buy ${product.name} ${selectedVariant.flavor} ${selectedVariant.size} now from sticky bar`}
            className="focus-ring h-12 rounded-md bg-lime text-sm font-semibold text-ink"
            onClick={handleAddToCart}
            type="button"
          >
            Buy now
          </button>
        </div>
      </div>
    </main>
  );
}

function GalleryPanel({
  item,
  product
}: {
  item: { alt: string; label: string; type: string; value?: string };
  product: StorefrontProduct;
}) {
  return (
    <div className="flex aspect-square flex-col justify-between rounded-md bg-mist p-6">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">{item.label}</p>
        <h2 className="mt-3 text-3xl font-black text-ink">{item.value}</h2>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate">{item.alt}</p>
      </div>
      <div className="grid gap-2 rounded-card bg-white p-4 text-sm text-slate shadow-sm">
        {item.type === "nutrition"
          ? product.nutritionFacts.slice(0, 4).map((fact) => (
              <div className="flex justify-between gap-4" key={fact.name}>
                <span>{fact.name}</span>
                <span className="font-black text-ink">{fact.amount}</span>
              </div>
            ))
          : null}
        {item.type === "ingredients" ? <span>{product.ingredients.join(", ")}</span> : null}
        {item.type === "panel" ? <span>{product.labelImageUrls[0] ? "Label image available for review." : "Label details are available in the authenticity section."}</span> : null}
        {item.type === "video" ? <span>{item.value}</span> : null}
      </div>
    </div>
  );
}

function OptionGroup({
  label,
  onSelect,
  options,
  selected
}: {
  label: string;
  onSelect: (value: string) => void;
  options: string[];
  selected: string;
}) {
  if (options.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-2 text-sm font-black text-ink">{label}</p>
      <div className="flex flex-wrap gap-2">
        {options.map((option) => (
          <button
            className={`focus-ring rounded-md border px-3 py-2 text-sm font-black ${
              selected === option ? "border-forest bg-mint text-forest" : "border-black/10 bg-white text-ink"
            }`}
            key={option}
            onClick={() => onSelect(option)}
            type="button"
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  );
}

function PurchaseTypeSelector({
  frequency,
  isSubscriptionAvailable,
  onFrequencyChange,
  onPurchaseTypeChange,
  purchaseType
}: {
  frequency: SubscriptionFrequency;
  isSubscriptionAvailable: boolean;
  onFrequencyChange: (value: SubscriptionFrequency) => void;
  onPurchaseTypeChange: (value: PurchaseType) => void;
  purchaseType: PurchaseType;
}) {
  return (
    <div className="rounded-md border border-black/10 p-3">
      <p className="text-sm font-black text-ink">Purchase option</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {(["one-time", "subscribe"] as PurchaseType[]).map((option) => (
          <button
            className={`focus-ring rounded-md border px-3 py-3 text-sm font-black ${
              purchaseType === option ? "border-forest bg-mint text-forest" : "border-black/10 bg-white text-ink"
            } ${option === "subscribe" && !isSubscriptionAvailable ? "opacity-50" : ""}`}
            disabled={option === "subscribe" && !isSubscriptionAvailable}
            key={option}
            onClick={() => onPurchaseTypeChange(option)}
            type="button"
          >
            {option === "one-time" ? "One-time purchase" : "Subscribe & Save"}
          </button>
        ))}
      </div>
      {purchaseType === "subscribe" ? (
        <div className="mt-3">
          <p className="mb-2 text-xs font-bold text-slate">Frequency</p>
          <div className="grid grid-cols-2 gap-2">
            {subscriptionFrequencies.map((option) => (
              <button
                className={`focus-ring rounded-md border px-3 py-2 text-sm font-black ${
                  frequency === option ? "border-forest bg-mint text-forest" : "border-black/10 bg-white text-ink"
                }`}
                key={option}
                onClick={() => onFrequencyChange(option)}
                type="button"
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Highlight({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className="mt-2 text-xl font-extrabold tracking-tight text-ink">{value}</p>
    </div>
  );
}

function DetailCard({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-extrabold tracking-tight text-ink">{title}</h2>
      {children}
    </section>
  );
}

function StackLinks({ products }: { products: StorefrontProduct[] }) {
  return (
    <div className="grid gap-3">
      {products.map((product) => (
        <Link
          className="flex items-center justify-between gap-3 rounded-md border border-black/10 p-3 text-sm font-bold text-ink hover:border-forest"
          href={`/products/${product.slug}`}
          key={product.id}
        >
          <span>{product.name}</span>
          <ChevronRight className="h-4 w-4 text-slate" />
        </Link>
      ))}
    </div>
  );
}

function ProductRail({ products, title }: { products: StorefrontProduct[]; title: string }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="mt-10">
      <h2 className="mb-5 text-2xl font-extrabold tracking-tight text-ink">{title}</h2>
      <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {products.slice(0, 4).map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}

function ReviewsSection({ product }: { product: StorefrontProduct }) {
  const [reviewMessage, setReviewMessage] = useState("");
  const reviews = productReviews.filter((review) => review.productId === product.id);
  const approvedReviews = reviews.filter((review) => review.status === "approved");
  const summary = getReviewSummary(reviews);
  const maxCount = Math.max(1, ...summary.breakdown.map((item) => item.count));

  return (
    <section className="mt-10 rounded-card border border-black/10 bg-white p-5 shadow-card">
      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div>
          <h2 className="text-2xl font-extrabold tracking-tight text-ink">Customer reviews</h2>
          <p className="mt-3 text-5xl font-extrabold tracking-tight text-ink">
            {(summary.average || product.merchandising.rating).toFixed(1)}
          </p>
          <RatingStars rating={summary.average || product.merchandising.rating} reviewCount={summary.total} />
          <div className="mt-5 grid gap-2">
            {summary.breakdown.map((item) => (
              <div className="grid grid-cols-[44px_1fr_48px] items-center gap-2 text-xs font-bold text-slate" key={item.rating}>
                <span>{item.rating} star</span>
                <div className="h-2 overflow-hidden rounded-full bg-cloud">
                  <div
                    className="h-full rounded-full bg-amber"
                    style={{ width: `${Math.max(8, (item.count / maxCount) * 100)}%` }}
                  />
                </div>
                <span className="text-right">{item.count}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 grid gap-2 rounded-md border border-black/10 bg-mist p-3 text-xs font-bold text-slate">
            <span>Taste: {summary.tasteAverage.toFixed(1)} / 5</span>
            <span>Mixability: {summary.mixabilityAverage.toFixed(1)} / 5</span>
            <span>Value: {summary.valueAverage.toFixed(1)} / 5</span>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {summary.commonTags.map((tag) => (
              <Badge key={tag} tone="neutral">{tag}</Badge>
            ))}
          </div>
        </div>
        <div className="grid gap-4">
          <div className="rounded-md border border-black/10 bg-mist/50 p-4">
            <h3 className="font-black text-ink">Write a review after purchase</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-4">
              <SelectMini label="Rating" options={["5", "4", "3", "2", "1"]} />
              <SelectMini label="Taste" options={["5", "4", "3", "2", "1"]} />
              <SelectMini label="Mixability" options={["5", "4", "3", "2", "1"]} />
              <SelectMini label="Value" options={["5", "4", "3", "2", "1"]} />
            </div>
            <input
              className="focus-ring mt-3 h-11 w-full rounded-md border border-black/10 px-3 text-sm"
              placeholder="Review title"
            />
            <textarea
              className="focus-ring mt-3 min-h-24 w-full rounded-md border border-black/10 p-3 text-sm"
              placeholder="Share taste, mixability, value, and label clarity."
            />
            <div className="mt-3 rounded-md border border-dashed border-black/20 bg-white p-3 text-xs font-bold text-slate">
              Add photo or video review
            </div>
            <button
              className="focus-ring mt-3 rounded-md bg-ink px-4 py-2 text-sm font-black text-white"
              onClick={() => setReviewMessage("Review submitted for moderation. Verified purchase check passed.")}
              type="button"
            >
              Submit review
            </button>
            {reviewMessage ? <p className="mt-3 rounded-md bg-mint p-2 text-xs font-bold text-forest">{reviewMessage}</p> : null}
          </div>
          {approvedReviews.map((review) => (
            <article className="rounded-md border border-black/10 bg-white p-4 shadow-sm" key={`${review.customerName}-${review.title}`}>
              <div className="flex flex-wrap items-center gap-2">
                <RatingStars rating={review.rating} />
                {review.isVerifiedPurchase ? <Badge tone="success">Verified purchase</Badge> : null}
                <Badge>Customer media</Badge>
              </div>
              <h3 className="mt-3 font-black text-ink">{review.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate">{review.comment}</p>
              <div className="mt-3 grid gap-2 rounded-md bg-mist p-3 text-xs font-bold text-slate sm:grid-cols-3">
                <span>Taste {review.tasteRating}/5</span>
                <span>Mixability {review.mixabilityRating}/5</span>
                <span>Value {review.valueRating}/5</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {review.tags.map((tag) => (
                  <Badge key={tag} tone="neutral">
                    {tag}
                  </Badge>
                ))}
              </div>
              {review.adminReply ? (
                <p className="mt-3 rounded-md bg-mint p-3 text-xs font-bold text-forest">Admin reply: {review.adminReply}</p>
              ) : null}
              <p className="mt-3 text-xs font-bold text-slate">{review.customerName}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function QAndASection({ product }: { product: StorefrontProduct }) {
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const visibleQuestions = productQuestions.filter(
    (question) =>
      question.productId === product.id &&
      question.status !== "hidden" &&
      (search.trim().length === 0 ||
        question.question.toLowerCase().includes(search.toLowerCase()) ||
        question.answer?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <DetailCard title="Customer Q&A">
      <div className="grid gap-3">
        <div className="rounded-md border border-black/10 p-3">
          <label className="text-sm font-black text-ink" htmlFor="question-search">
            Search Q&A
          </label>
          <input
            className="focus-ring mt-2 h-11 w-full rounded-md border border-black/10 px-3 text-sm"
            id="question-search"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search flavor, delivery, serving size"
            value={search}
          />
        </div>
        <div className="rounded-md border border-black/10 p-3">
          <label className="text-sm font-black text-ink" htmlFor="question">
            Ask a question
          </label>
          <textarea
            className="focus-ring mt-2 min-h-24 w-full rounded-md border border-black/10 p-3 text-sm"
            id="question"
            placeholder="Ask about flavor, serving size, delivery, or product details"
          />
          <button
            className="focus-ring mt-2 rounded-md bg-ink px-4 py-2 text-sm font-black text-white"
            onClick={() => setMessage("Question submitted as pending moderation for admin answer.")}
            type="button"
          >
            Submit question
          </button>
          {message ? <p className="mt-3 rounded-md bg-mint p-2 text-xs font-bold text-forest">{message}</p> : null}
        </div>
        {visibleQuestions.map((question) => (
          <div className="rounded-md bg-mist p-3" key={question.id}>
            <p className="text-sm font-black text-ink">Q: {question.question}</p>
            <p className="mt-2 text-sm leading-6 text-slate">
              A: {question.answer ?? "Pending admin answer."}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {question.isAdminAnswered ? <Badge tone="success">Answered</Badge> : <Badge tone="neutral">Pending moderation</Badge>}
              {question.isAdminAnswered ? <Badge tone="success">Admin answered</Badge> : null}
            </div>
          </div>
        ))}
      </div>
    </DetailCard>
  );
}

function SelectMini({ label, options }: { label: string; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-black text-slate">{label}</span>
      <select className="focus-ring h-10 w-full rounded-md border border-black/10 bg-white px-2 text-sm font-bold text-ink">
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function nutritionValue(product: StorefrontProduct, name: string) {
  return product.nutritionFacts.find((fact) => fact.name.toLowerCase() === name.toLowerCase())?.amount;
}

function unique(values: Array<string | undefined>) {
  return [...new Set(values.filter(Boolean) as string[])];
}
