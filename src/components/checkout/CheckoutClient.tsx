"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { customers } from "@/mock/customers";
import { storefrontProducts } from "@/mock/storefront";
import type { CartLineItem, CouponResult } from "@/types/cart";
import type { CheckoutAddress, CheckoutMode, DeliveryMethod, PaymentMethod } from "@/types/checkout";
import { calculateCartTotals, applyCoupon, formatRs } from "@/lib/cart/cartPricing";
import { clearLocalCart } from "@/lib/cart/localCart";
import { useCart } from "@/lib/cart/useCart";
import { useCustomerSession } from "@/lib/auth/useCustomerSession";
import { createMockCheckoutOrder } from "@/lib/orders/localOrders";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { CartSummaryCard } from "@/components/cart/CartSummaryCard";

const defaultAddress: CheckoutAddress = {
  addressLine1: "",
  addressLine2: "",
  city: "",
  country: "India",
  email: "",
  fullName: "",
  phone: "",
  pincode: "",
  state: ""
};

const deliveryMethods: Array<{ description: string; label: string; value: DeliveryMethod }> = [
  { description: "2-5 business days. Free above threshold.", label: "Standard delivery", value: "standard" },
  { description: "Priority dispatch placeholder.", label: "Express delivery", value: "express" }
];

const paymentMethods: Array<{ label: string; value: PaymentMethod }> = [
  { label: "UPI", value: "upi" },
  { label: "Card", value: "card" },
  { label: "Net banking", value: "net_banking" },
  { label: "Wallet", value: "wallet" },
  { label: "COD", value: "cod" }
];

export function CheckoutClient() {
  const router = useRouter();
  const cart = useCart();
  const { session } = useCustomerSession();
  const [checkoutMode, setCheckoutMode] = useState<CheckoutMode>("guest");
  const [address, setAddress] = useState<CheckoutAddress>(defaultAddress);
  const [couponInput, setCouponInput] = useState("");
  const [couponResult, setCouponResult] = useState<CouponResult | null>(null);
  const [loyaltyPointsToRedeem, setLoyaltyPointsToRedeem] = useState(0);
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("standard");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutAddress, string>>>({});
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [notice, setNotice] = useState("");
  const enrichedItems = useMemo(() => cart.items.map(enrichCartItem), [cart.items]);
  const totals = useMemo(
    () =>
      calculateCartTotals(enrichedItems, couponResult?.ok ? couponResult.code : undefined, {
        loyaltyPointsToRedeem
      }),
    [couponResult, enrichedItems, loyaltyPointsToRedeem]
  );
  const savedAddress = useMemo(() => {
    if (!session) {
      return undefined;
    }

    return customers.find((customer) => customer.id === session.customerId)?.addresses[0];
  }, [session]);

  function updateAddress(key: keyof CheckoutAddress, value: string) {
    setAddress((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  function useSavedAddress() {
    if (!savedAddress || !session) {
      return;
    }

    setAddress({
      addressLine1: savedAddress.line1,
      addressLine2: savedAddress.line2 ?? "",
      city: savedAddress.city,
      country: savedAddress.country,
      email: session.email,
      fullName: `${savedAddress.firstName} ${savedAddress.lastName}`,
      phone: savedAddress.phone,
      pincode: savedAddress.postalCode,
      state: savedAddress.state
    });
    setNotice("Saved address selected.");
  }

  function handleApplyCoupon() {
    const result = applyCoupon(enrichedItems, couponInput);
    setCouponResult(result);
  }

  async function handlePlaceOrder() {
    const nextErrors = validateAddress(address);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setNotice("Please fix the highlighted address fields.");
      return;
    }

    setIsPlacingOrder(true);
    setNotice("Creating secure mock order...");

    try {
      const order = await createMockCheckoutOrder({
        address,
        couponCode: totals.couponCode,
        customerId: session?.customerId,
        deliveryMethod,
        items: enrichedItems,
        paymentMethod,
        totals: {
          couponDiscount: totals.couponDiscount,
          grandTotal: totals.grandTotal,
          shipping: totals.shipping,
          subtotal: totals.subtotal,
          tax: totals.tax
        }
      });
      clearLocalCart();
      cart.clearCart();
      router.push(`/checkout/success?order=${order.orderNumber}`);
    } catch {
      router.push("/checkout/failure?reason=mock-payment");
    } finally {
      setIsPlacingOrder(false);
    }
  }

  if (!cart.isReady) {
    return (
      <main className="container-page py-10">
        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <Skeleton className="h-96" />
          <Skeleton className="h-80" />
        </div>
      </main>
    );
  }

  if (enrichedItems.length === 0) {
    return (
      <main className="container-page py-16">
        <EmptyState
          action={<Button href="/products" variant="dark">Shop products</Button>}
          description="Your cart is empty. Add a product before checkout."
          title="Checkout needs a cart"
        />
      </main>
    );
  }

  return (
    <main className="container-page py-8 lg:py-12">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">Checkout</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Secure checkout</h1>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-5">
          <Panel title="Checkout mode">
            <div className="grid gap-3 sm:grid-cols-2">
              {(["guest", "login"] as CheckoutMode[]).map((mode) => (
                <button
                  className={`focus-ring rounded-md border p-4 text-left ${checkoutMode === mode ? "border-forest bg-mint" : "border-black/10 bg-white"}`}
                  key={mode}
                  onClick={() => setCheckoutMode(mode)}
                  type="button"
                >
                  <span className="font-black text-ink">{mode === "guest" ? "Guest checkout" : "Login checkout"}</span>
                  <span className="mt-1 block text-xs font-semibold text-slate">
                    {mode === "guest" ? "Continue without an account." : session ? `Using ${session.email}` : "Login route is ready."}
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Address">
            {savedAddress ? (
              <button className="focus-ring mb-4 rounded-md border border-black/10 bg-mist px-4 py-3 text-left text-sm font-bold text-ink" onClick={useSavedAddress} type="button">
                Use saved address: {savedAddress.line1}, {savedAddress.city} {savedAddress.postalCode}
              </button>
            ) : null}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input error={errors.fullName} label="Full name" onChange={(event) => updateAddress("fullName", event.target.value)} value={address.fullName} />
              <Input error={errors.phone} inputMode="tel" label="Phone" onChange={(event) => updateAddress("phone", event.target.value)} value={address.phone} />
              <Input error={errors.email} label="Email" onChange={(event) => updateAddress("email", event.target.value)} type="email" value={address.email} />
              <Input error={errors.pincode} inputMode="numeric" label="Pincode" maxLength={6} onChange={(event) => updateAddress("pincode", event.target.value.replace(/\D/g, ""))} value={address.pincode} />
              <Input className="sm:col-span-2" error={errors.addressLine1} label="Address line 1" onChange={(event) => updateAddress("addressLine1", event.target.value)} value={address.addressLine1} />
              <Input className="sm:col-span-2" label="Address line 2" onChange={(event) => updateAddress("addressLine2", event.target.value)} value={address.addressLine2} />
              <Input error={errors.city} label="City" onChange={(event) => updateAddress("city", event.target.value)} value={address.city} />
              <Input error={errors.state} label="State" onChange={(event) => updateAddress("state", event.target.value)} value={address.state} />
              <Input label="Country" onChange={(event) => updateAddress("country", event.target.value)} value={address.country} />
            </div>
            <p className="mt-3 text-xs font-semibold text-slate">
              Pincode serviceability placeholder: valid 6-digit Indian pincodes show as serviceable in this mock flow.
            </p>
          </Panel>

          <Panel title="Delivery method">
            <div className="grid gap-3 sm:grid-cols-2">
              {deliveryMethods.map((method) => (
                <button
                  className={`focus-ring rounded-md border p-4 text-left ${deliveryMethod === method.value ? "border-forest bg-mint" : "border-black/10 bg-white"}`}
                  key={method.value}
                  onClick={() => setDeliveryMethod(method.value)}
                  type="button"
                >
                  <span className="font-black text-ink">{method.label}</span>
                  <span className="mt-1 block text-xs font-semibold text-slate">{method.description}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Payment method">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {paymentMethods.map((method) => (
                <button
                  className={`focus-ring rounded-md border px-3 py-3 text-sm font-black ${paymentMethod === method.value ? "border-forest bg-mint text-forest" : "border-black/10 bg-white text-ink"}`}
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  type="button"
                >
                  {method.label}
                </button>
              ))}
            </div>
            {paymentMethod === "cod" ? (
              <p className="mt-3 rounded-md bg-mist p-3 text-xs font-bold text-slate">
                COD confirmation placeholder: final COD verification can later be connected to OTP or courier rules.
              </p>
            ) : null}
          </Panel>

          <Panel title="Coupon">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                className="focus-ring h-11 rounded-md border border-black/10 px-3 text-sm font-semibold uppercase"
                onChange={(event) => setCouponInput(event.target.value)}
                placeholder="FIT300"
                value={couponInput}
              />
              <button className="focus-ring rounded-md bg-ink px-4 text-sm font-black text-white" onClick={handleApplyCoupon} type="button">
                Apply
              </button>
            </div>
            {couponResult ? <p className="mt-2 text-xs font-bold text-forest">{couponResult.message}</p> : null}
          </Panel>

          <Panel title="Loyalty points">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <Input
                inputMode="numeric"
                label="Redeem points"
                max={420}
                min={0}
                onChange={(event) => setLoyaltyPointsToRedeem(Math.min(420, Number(event.target.value) || 0))}
                type="number"
                value={loyaltyPointsToRedeem}
              />
              <button className="focus-ring h-11 rounded-md bg-ink px-4 text-sm font-black text-white" onClick={() => setLoyaltyPointsToRedeem(100)} type="button">
                Redeem 100
              </button>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate">
              1 point = Rs 1 in this mock program. You will earn {totals.loyaltyEarnedPoints} points after this order.
            </p>
          </Panel>

          {notice ? <p className="rounded-md bg-mint p-3 text-sm font-bold text-forest">{notice}</p> : null}
          <button className="focus-ring h-12 rounded-md bg-lime text-sm font-black text-ink hover:bg-mint" disabled={isPlacingOrder} onClick={handlePlaceOrder} type="button">
            {isPlacingOrder ? "Placing order..." : `Place order - ${formatRs(totals.grandTotal)}`}
          </button>
          <button className="focus-ring rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-black text-coral" onClick={() => router.push("/checkout/failure?reason=manual-test")} type="button">
            Simulate payment failure
          </button>
        </div>

        <div className="lg:sticky lg:top-5 lg:self-start">
          <CartSummaryCard items={enrichedItems} totals={totals} />
        </div>
      </section>
    </main>
  );
}

function Panel({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-xl font-black tracking-tight text-ink">{title}</h2>
      {children}
    </section>
  );
}

function validateAddress(address: CheckoutAddress) {
  const errors: Partial<Record<keyof CheckoutAddress, string>> = {};

  if (address.fullName.trim().length < 2) errors.fullName = "Enter full name.";
  if (!/^[0-9+\-\s]{8,16}$/.test(address.phone.trim())) errors.phone = "Enter valid phone.";
  if (!/^\S+@\S+\.\S+$/.test(address.email.trim())) errors.email = "Enter valid email.";
  if (address.addressLine1.trim().length < 6) errors.addressLine1 = "Enter address line 1.";
  if (address.city.trim().length < 2) errors.city = "Enter city.";
  if (address.state.trim().length < 2) errors.state = "Enter state.";
  if (!/^[1-9][0-9]{5}$/.test(address.pincode)) errors.pincode = "Enter valid 6-digit pincode.";

  return errors;
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
