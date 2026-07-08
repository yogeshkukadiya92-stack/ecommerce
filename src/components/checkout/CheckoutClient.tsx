"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { customers } from "@/mock/customers";
import { storefrontProducts, type StorefrontProduct } from "@/mock/storefront";
import type { CartLineItem, CouponResult } from "@/types/cart";
import type { CheckoutAddress, CheckoutMode, DeliveryMethod, PaymentMethod } from "@/types/checkout";
import { calculateCartTotals, applyCoupon, formatRs } from "@/lib/cart/cartPricing";
import { clearLocalCart } from "@/lib/cart/localCart";
import { useCart } from "@/lib/cart/useCart";
import { useCustomerSession } from "@/lib/auth/useCustomerSession";
import {
  createMockCheckoutOrder,
  createPendingCheckoutOrder,
  updateLocalOrderPayment
} from "@/lib/orders/localOrders";
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
  { description: "Priority dispatch for faster delivery windows.", label: "Express delivery", value: "express" }
];

const paymentMethods: Array<{ label: string; value: PaymentMethod }> = [
  { label: "UPI", value: "upi" },
  { label: "Card", value: "card" },
  { label: "Net banking", value: "net_banking" },
  { label: "Wallet", value: "wallet" },
  { label: "COD", value: "cod" }
];

type RazorpayCheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

type RazorpayFailureResponse = {
  error?: {
    code?: string;
    description?: string;
    metadata?: {
      order_id?: string;
      payment_id?: string;
    };
    reason?: string;
  };
};

type RazorpayCheckoutOptions = {
  amount: number;
  currency: string;
  description: string;
  handler: (response: RazorpayCheckoutResponse) => void;
  key: string;
  modal: {
    ondismiss: () => void;
  };
  name: string;
  notes: Record<string, string>;
  order_id: string;
  prefill: {
    contact: string;
    email: string;
    name: string;
  };
  theme: {
    color: string;
  };
};

type RazorpayCheckoutInstance = {
  on: (event: "payment.failed", callback: (response: RazorpayFailureResponse) => void) => void;
  open: () => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckoutInstance;
  }
}

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
  const [catalogProducts, setCatalogProducts] = useState<StorefrontProduct[]>(storefrontProducts);
  const enrichedItems = useMemo(() => cart.items.map((item) => enrichCartItem(item, catalogProducts)), [cart.items, catalogProducts]);
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

  useEffect(() => {
    let isMounted = true;

    fetch("/api/products")
      .then((response) => response.json())
      .then((result: { data?: StorefrontProduct[] }) => {
        if (isMounted && result.data?.length) {
          setCatalogProducts(result.data);
        }
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

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
    setNotice(paymentMethod === "cod" ? "Creating COD order..." : "Opening secure Razorpay checkout...");

    try {
      if (paymentMethod !== "cod") {
        await handleRazorpayPayment();
        return;
      }

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
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Payment could not be started. Please try again.");
      if (paymentMethod === "cod") {
        router.push("/checkout/failure?reason=cod-order");
      }
    } finally {
      setIsPlacingOrder(false);
    }
  }

  async function handleRazorpayPayment() {
    const order = createPendingCheckoutOrder({
      address,
      couponCode: totals.couponCode,
      customerId: session?.customerId,
      deliveryMethod,
      items: enrichedItems,
      paymentMethod,
      provider: "razorpay",
      totals: {
        couponDiscount: totals.couponDiscount,
        grandTotal: totals.grandTotal,
        shipping: totals.shipping,
        subtotal: totals.subtotal,
        tax: totals.tax
      }
    });
    const initializedPayment = await initializeRazorpayPayment({
      amount: totals.grandTotal,
      customer: {
        email: address.email,
        name: address.fullName,
        phone: address.phone
      },
      orderNumber: order.orderNumber
    });

    updateLocalOrderPayment(
      order.orderNumber,
      {
        provider: "razorpay",
        providerOrderId: initializedPayment.razorpayOrderId,
        status: "pending"
      },
      {
        note: "Razorpay order initialized and waiting for customer authorization.",
        status: "pending"
      }
    );

    await loadRazorpayCheckoutScript();

    if (!window.Razorpay) {
      throw new Error("Razorpay checkout could not be loaded. Please retry or choose COD.");
    }

    const checkout = new window.Razorpay({
      amount: initializedPayment.amount,
      currency: initializedPayment.currency,
      description: `FitSupplement order ${order.orderNumber}`,
      handler: async (response) => {
        setNotice("Verifying Razorpay payment...");

        try {
          const verifiedPayment = await verifyRazorpayPayment({
            checkoutOrderNumber: order.orderNumber,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature
          });

          updateLocalOrderPayment(
            order.orderNumber,
            {
              provider: "razorpay",
              providerOrderId: verifiedPayment.providerOrderId,
              signature: verifiedPayment.signature,
              status: "paid",
              transactionId: verifiedPayment.providerPaymentId
            },
            {
              note: "Razorpay payment verified successfully.",
              status: "paid"
            }
          );
          clearLocalCart();
          cart.clearCart();
          router.push(`/checkout/success?order=${order.orderNumber}`);
        } catch (error) {
          updateLocalOrderPayment(
            order.orderNumber,
            {
              failureReason: error instanceof Error ? error.message : "Razorpay verification failed.",
              status: "failed"
            },
            {
              note: "Razorpay payment verification failed.",
              status: "pending"
            }
          );
          router.push(`/checkout/failure?reason=razorpay-verification&order=${order.orderNumber}`);
        }
      },
      key: initializedPayment.keyId,
      modal: {
        ondismiss: () => {
          updateLocalOrderPayment(
            order.orderNumber,
            {
              provider: "razorpay",
              providerOrderId: initializedPayment.razorpayOrderId,
              status: "pending"
            },
            {
              note: "Razorpay checkout was closed before payment completion.",
              status: "pending"
            }
          );
          setNotice("Payment is still pending. You can retry Razorpay or choose COD.");
          setIsPlacingOrder(false);
        }
      },
      name: "FitSupplement Store",
      notes: {
        checkoutOrderNumber: order.orderNumber
      },
      order_id: initializedPayment.razorpayOrderId,
      prefill: {
        contact: address.phone,
        email: address.email,
        name: address.fullName
      },
      theme: {
        color: "#0f3d2e"
      }
    });

    checkout.on("payment.failed", (response) => {
      const reason = response.error?.description ?? response.error?.reason ?? "Razorpay payment failed.";
      updateLocalOrderPayment(
        order.orderNumber,
        {
          failureReason: reason,
          provider: "razorpay",
          providerOrderId: response.error?.metadata?.order_id ?? initializedPayment.razorpayOrderId,
          status: "failed",
          transactionId: response.error?.metadata?.payment_id
        },
        {
          note: reason,
          status: "pending"
        }
      );
      router.push(`/checkout/failure?reason=razorpay-payment-failed&order=${order.orderNumber}`);
    });

    checkout.open();
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
      <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">Checkout</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink">Secure checkout</h1>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-black text-forest">
          {["Encrypted payment", "Address validation", "COD supported"].map((item) => (
            <span className="rounded-md bg-mist px-3 py-2" key={item}>{item}</span>
          ))}
        </div>
      </div>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="grid gap-5">
          <Panel title="1. Checkout mode">
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
                    {mode === "guest" ? "Continue without an account." : session ? `Using ${session.email}` : "Login to use saved details."}
                  </span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="2. Delivery address">
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
              Enter a valid 6-digit pincode to confirm delivery availability before placing the order.
            </p>
          </Panel>

          <Panel title="3. Delivery method">
            <div className="grid gap-3 sm:grid-cols-2">
              {deliveryMethods.map((method) => (
                <button
                  className={`focus-ring rounded-md border p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-forest/30 ${deliveryMethod === method.value ? "border-forest bg-mint text-forest shadow-card" : "border-black/10 bg-white text-ink"}`}
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

          <Panel title="4. Payment method">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {paymentMethods.map((method) => (
                <button
                  className={`focus-ring rounded-md border px-3 py-3 text-sm font-black shadow-sm transition hover:-translate-y-0.5 hover:border-forest/30 ${paymentMethod === method.value ? "border-forest bg-mint text-forest shadow-card" : "border-black/10 bg-white text-ink"}`}
                  key={method.value}
                  onClick={() => setPaymentMethod(method.value)}
                  type="button"
                >
                  {method.label}
                </button>
              ))}
            </div>
            {paymentMethod === "cod" ? (
              <p className="mt-3 rounded-md border border-black/10 bg-mist p-3 text-xs font-bold text-slate">
                COD orders may require phone confirmation before dispatch.
              </p>
            ) : (
              <p className="mt-3 rounded-md border border-forest/10 bg-mint/60 p-3 text-xs font-bold text-forest">
                Online payments open Razorpay Checkout. Secret keys stay on the server and payment signatures are verified before the order is marked paid.
              </p>
            )}
          </Panel>

          <Panel title="Coupon">
            <div className="grid grid-cols-[1fr_auto] gap-2">
              <input
                className="focus-ring h-11 rounded-md border border-black/10 px-3 text-sm font-semibold uppercase shadow-sm transition hover:border-forest/40"
                onChange={(event) => setCouponInput(event.target.value)}
                placeholder="FIT300"
                value={couponInput}
              />
              <button className="focus-ring rounded-md bg-ink px-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-forest" onClick={handleApplyCoupon} type="button">
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
              <button className="focus-ring h-11 rounded-md bg-ink px-4 text-sm font-black text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-forest" onClick={() => setLoyaltyPointsToRedeem(100)} type="button">
                Redeem 100
              </button>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate">
              1 point = Rs 1. You will earn {totals.loyaltyEarnedPoints} points after this order.
            </p>
          </Panel>

          {notice ? <p className="rounded-md bg-mint p-3 text-sm font-bold text-forest">{notice}</p> : null}
          <button className="focus-ring h-12 rounded-md bg-lime text-sm font-semibold text-ink shadow-sm hover:bg-mint" disabled={isPlacingOrder} onClick={handlePlaceOrder} type="button">
            {isPlacingOrder ? "Placing order..." : `Place order - ${formatRs(totals.grandTotal)}`}
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
      <h2 className="mb-4 text-xl font-extrabold tracking-tight text-ink">{title}</h2>
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

function enrichCartItem(item: CartLineItem, products: StorefrontProduct[]): CartLineItem {
  const product = products.find((candidate) => candidate.id === item.productId) ?? storefrontProducts.find((candidate) => candidate.id === item.productId);
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

async function initializeRazorpayPayment(input: {
  amount: number;
  customer: {
    email: string;
    name: string;
    phone: string;
  };
  orderNumber: string;
}) {
  const response = await fetch("/api/payments/razorpay/initiate", {
    body: JSON.stringify({
      amount: input.amount,
      currency: "INR",
      customer: input.customer,
      notes: {
        checkoutOrderNumber: input.orderNumber
      },
      receipt: input.orderNumber
    }),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
  const data = (await response.json()) as {
    amount?: number;
    currency?: string;
    keyId?: string;
    message?: string;
    razorpayOrderId?: string;
  };

  if (!response.ok || !data.keyId || !data.razorpayOrderId || !data.amount || !data.currency) {
    throw new Error(data.message ?? "Razorpay payment could not be initialized. Please try COD or retry later.");
  }

  return {
    amount: data.amount,
    currency: data.currency,
    keyId: data.keyId,
    razorpayOrderId: data.razorpayOrderId
  };
}

async function verifyRazorpayPayment(input: RazorpayCheckoutResponse & {
  checkoutOrderNumber: string;
}) {
  const response = await fetch("/api/payments/razorpay/verify", {
    body: JSON.stringify(input),
    headers: {
      "Content-Type": "application/json"
    },
    method: "POST"
  });
  const data = (await response.json()) as {
    message?: string;
    providerOrderId?: string;
    providerPaymentId?: string;
    signature?: string;
    status?: "paid";
    verified?: boolean;
  };

  if (!response.ok || !data.verified || !data.providerOrderId || !data.providerPaymentId || !data.signature) {
    throw new Error(data.message ?? "Razorpay payment verification failed.");
  }

  return {
    providerOrderId: data.providerOrderId,
    providerPaymentId: data.providerPaymentId,
    signature: data.signature,
    status: data.status ?? "paid"
  };
}

function loadRazorpayCheckoutScript() {
  if (window.Razorpay) {
    return Promise.resolve();
  }

  return new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>("script[data-razorpay-checkout]");

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Razorpay checkout script failed to load.")), {
        once: true
      });
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.dataset.razorpayCheckout = "true";
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Razorpay checkout script failed to load."));
    document.body.appendChild(script);
  });
}
