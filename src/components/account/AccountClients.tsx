"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Package, RotateCcw, Settings, Truck } from "lucide-react";
import { customers } from "@/mock/customers";
import { productReviews } from "@/mock/engagement";
import { loyaltyPointEntries, referralRecords, subscriptions } from "@/mock/promotions";
import { storefrontProducts } from "@/mock/storefront";
import type { CheckoutOrder } from "@/types/checkout";
import type { CustomerSession } from "@/types/auth";
import { logoutCustomer } from "@/lib/auth/customerAuth";
import { useCustomerSession } from "@/lib/auth/useCustomerSession";
import { readLocalOrders } from "@/lib/orders/localOrders";
import { formatRs } from "@/lib/cart/cartPricing";
import { loyaltyBalance } from "@/lib/promotions/promotionService";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

const accountLinks = [
  { href: "/account", label: "Dashboard" },
  { href: "/account/orders", label: "My orders" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/account/addresses", label: "Saved addresses" },
  { href: "/account/subscriptions", label: "Subscriptions" },
  { href: "/account/loyalty", label: "Loyalty points" },
  { href: "/account/referrals", label: "Referral code" },
  { href: "/account/reviews", label: "Reviews" },
  { href: "/account/profile", label: "Profile settings" },
  { href: "/account/notifications", label: "Notifications" }
];

export function AccountDashboardClient() {
  return (
    <AccountGate>
      {({ orders }) => (
        <div className="grid gap-5">
          <div className="grid gap-4 sm:grid-cols-3">
            <Metric label="Orders" value={String(orders.length)} />
            <Metric label="Active subscriptions" value={String(subscriptions.filter((item) => item.status === "active").length)} />
            <Metric label="Loyalty points" value={String(loyaltyBalance("cust-aarav"))} />
          </div>
          <section className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="text-xl font-black text-ink">Recent orders</h2>
            <OrderList orders={orders.slice(0, 3)} />
          </section>
        </div>
      )}
    </AccountGate>
  );
}

export function AccountOrdersClient() {
  return (
    <AccountGate>
      {({ orders }) => (
        <section className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
          <h1 className="text-2xl font-black tracking-tight text-ink">My orders</h1>
          <OrderList orders={orders} />
        </section>
      )}
    </AccountGate>
  );
}

export function AccountOrderDetailClient({ orderNumber }: { orderNumber: string }) {
  return (
    <AccountGate>
      {({ orders }) => {
        const order = orders.find((candidate) => candidate.orderNumber === orderNumber);

        if (!order) {
          return (
            <section className="rounded-card border border-black/10 bg-white p-6 shadow-sm">
              <h1 className="text-2xl font-black text-ink">Order not found</h1>
              <Button className="mt-4" href="/account/orders" variant="dark">Back to orders</Button>
            </section>
          );
        }

        return (
          <section className="grid gap-5">
            <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">Order detail</p>
                  <h1 className="mt-2 text-2xl font-black tracking-tight text-ink">{order.orderNumber}</h1>
                </div>
                <Badge tone="success">{order.status}</Badge>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <ActionCard icon={<Truck className="h-5 w-5" />} label="Track shipment" text="Courier tracking placeholder" />
                <ActionCard icon={<Package className="h-5 w-5" />} label="Invoice" text="Download placeholder" />
                <ActionCard icon={<RotateCcw className="h-5 w-5" />} label="Return/refund" text="Request placeholder" />
              </div>
            </div>
            <section className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
              <h2 className="text-xl font-black text-ink">Items</h2>
              <div className="mt-4 grid gap-3">
                {order.items.map((item) => (
                  <div className="flex items-center justify-between gap-4 rounded-md bg-mist p-3 text-sm" key={item.lineId}>
                    <div>
                      <p className="font-black text-ink">{item.productName}</p>
                      <p className="mt-1 font-semibold text-slate">{item.sku} x {item.quantity}</p>
                    </div>
                    <p className="font-black text-ink">{formatRs(item.total)}</p>
                  </div>
                ))}
              </div>
            </section>
          </section>
        );
      }}
    </AccountGate>
  );
}

export function AccountSectionClient({ section }: { section: string }) {
  return (
    <AccountGate>
      {({ session }) => <SectionContent section={section} sessionEmail={session.email} />}
    </AccountGate>
  );
}

function AccountGate({
  children
}: {
  children: (value: { orders: CheckoutOrder[]; session: CustomerSession }) => ReactNode;
}) {
  const { isReady, session } = useCustomerSession();
  const [orders] = useState(() => (typeof window === "undefined" ? [] : readLocalOrders()));
  const visibleOrders = useMemo(
    () => (session ? orders.filter((order) => !order.customerId || order.customerId === session.customerId || order.customerId === "cust-aarav") : []),
    [orders, session]
  );

  if (!isReady) {
    return <Skeleton className="h-96" />;
  }

  if (!session) {
    return (
      <section className="rounded-card border border-black/10 bg-white p-6 text-center shadow-card">
        <h1 className="text-2xl font-black text-ink">Login required</h1>
        <p className="mt-3 text-sm text-slate">Customer account pages are protected by the mock session guard.</p>
        <Button className="mt-5" href="/login" variant="dark">Login to continue</Button>
      </section>
    );
  }

  return (
    <main className="container-page py-8 lg:py-12">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">Account</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink">Hi, {session.fullName}</h1>
        </div>
        <button className="focus-ring rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-black" onClick={logoutCustomer} type="button">
          Logout
        </button>
      </div>
      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="grid content-start gap-2 rounded-card border border-black/10 bg-white p-3 shadow-sm">
          {accountLinks.map((link) => (
            <Link className="rounded-md px-3 py-2 text-sm font-black text-slate hover:bg-mist hover:text-ink" href={link.href} key={link.href}>
              {link.label}
            </Link>
          ))}
        </nav>
        {children({ orders: visibleOrders, session })}
      </div>
    </main>
  );
}

function OrderList({ orders }: { orders: CheckoutOrder[] }) {
  if (orders.length === 0) {
    return <p className="mt-4 rounded-md bg-mist p-4 text-sm font-semibold text-slate">No orders yet.</p>;
  }

  return (
    <div className="mt-4 grid gap-3">
      {orders.map((order) => (
        <Link className="grid gap-3 rounded-md border border-black/10 p-4 hover:border-forest sm:grid-cols-[1fr_auto]" href={`/account/orders/${order.orderNumber}`} key={order.id}>
          <div>
            <p className="font-black text-ink">{order.orderNumber}</p>
            <p className="mt-1 text-sm font-semibold text-slate">{order.items.length} items - {order.payment.method.toUpperCase()}</p>
          </div>
          <div className="text-left sm:text-right">
            <Badge tone="success">{order.status}</Badge>
            <p className="mt-2 font-black text-ink">{formatRs(order.totalAmount)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function SectionContent({ section, sessionEmail }: { section: string; sessionEmail: string }) {
  const customer = customers[0];
  const wishlistProducts = storefrontProducts.slice(0, 3);
  const customerReviews = productReviews.filter((review) => review.customerId === customer.id);

  const content: Record<string, ReactNode> = {
    addresses: (
      <div className="grid gap-3">
        {customer.addresses.map((address) => (
          <div className="rounded-md bg-mist p-4 text-sm font-semibold text-slate" key={address.id}>
            {address.line1}, {address.city}, {address.state} {address.postalCode}
          </div>
        ))}
      </div>
    ),
    loyalty: (
      <div className="grid gap-4">
        <div className="rounded-md bg-mist p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate">Available points</p>
          <p className="mt-2 text-3xl font-black text-ink">{loyaltyBalance(customer.id)}</p>
        </div>
        <div className="grid gap-3">
          {loyaltyPointEntries
            .filter((entry) => entry.customerId === customer.id)
            .map((entry) => (
              <div className="flex items-center justify-between gap-4 rounded-md bg-mist p-3 text-sm" key={entry.id}>
                <div>
                  <p className="font-black text-ink">{entry.note}</p>
                  <p className="text-xs font-semibold text-slate">{entry.at} - {entry.type.replace("_", " ")}</p>
                </div>
                <p className={entry.points >= 0 ? "font-black text-forest" : "font-black text-coral"}>{entry.points}</p>
              </div>
            ))}
        </div>
        <p className="text-sm text-slate">Earn points on purchase, reviews, and referrals. Expiry and VIP segment rules are placeholder-ready.</p>
      </div>
    ),
    notifications: (
      <div className="grid gap-3">
        {["Order updates", "Price drop alerts", "Subscription reminders", "Newsletter"].map((item) => (
          <label className="flex items-center justify-between rounded-md bg-mist p-3 text-sm font-bold" key={item}>
            <span>{item}</span>
            <input defaultChecked={item !== "Newsletter"} type="checkbox" />
          </label>
        ))}
      </div>
    ),
    profile: (
      <div className="grid gap-3 text-sm font-semibold text-slate">
        <p>Email: {sessionEmail}</p>
        <p>Profile settings placeholder for name, phone, password, and OTP verification.</p>
      </div>
    ),
    referrals: (
      <div className="grid gap-4">
        {referralRecords
          .filter((referral) => referral.referrerCustomerId === customer.id)
          .map((referral) => (
            <div className="rounded-md bg-mist p-4" key={referral.id}>
              <Metric label="Referral code" value={referral.code} />
              <p className="mt-3 text-sm font-semibold text-slate">Landing link: {referral.landingLink}</p>
              <p className="mt-2 text-sm text-slate">You get: {referral.referrerReward}</p>
              <p className="mt-1 text-sm text-slate">Friend gets: {referral.friendReward}</p>
              <Badge tone="success">{referral.status}</Badge>
            </div>
          ))}
      </div>
    ),
    reviews: (
      <div className="grid gap-4">
        <div className="rounded-md bg-mist p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-slate">Review after purchase</p>
          <p className="mt-2 text-sm font-semibold leading-6 text-slate">
            Delivered-order review requests will appear here with taste, mixability, value, title, comment, and photo/video upload placeholders.
          </p>
          <button className="focus-ring mt-3 rounded-md bg-ink px-4 py-2 text-sm font-black text-white" type="button">
            Write pending purchase review
          </button>
        </div>
        {customerReviews.map((review) => (
          <div className="rounded-md border border-black/10 p-4" key={review.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-black text-ink">{review.productName}</p>
                <p className="mt-1 text-sm font-semibold text-slate">{review.title}</p>
              </div>
              <Badge tone={review.status === "approved" ? "success" : review.status === "reported" ? "sale" : "neutral"}>
                {review.status}
              </Badge>
            </div>
            <p className="mt-3 text-sm leading-6 text-slate">{review.comment}</p>
            <div className="mt-3 grid gap-2 rounded-md bg-mist p-3 text-xs font-bold text-slate sm:grid-cols-4">
              <span>Rating {review.rating}/5</span>
              <span>Taste {review.tasteRating}/5</span>
              <span>Mixability {review.mixabilityRating}/5</span>
              <span>Value {review.valueRating}/5</span>
            </div>
            {review.adminReply ? (
              <p className="mt-3 rounded-md bg-mint p-3 text-xs font-bold text-forest">Admin reply: {review.adminReply}</p>
            ) : null}
          </div>
        ))}
      </div>
    ),
    subscriptions: (
      <div className="grid gap-3">
        {subscriptions
          .filter((subscription) => subscription.customerId === customer.id)
          .map((subscription) => (
            <div className="rounded-md border border-black/10 p-4" key={subscription.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-black text-ink">{subscription.productId}</p>
                  <p className="mt-1 text-sm font-semibold text-slate">
                    {subscription.frequency} - next delivery {subscription.nextDeliveryDate} - {subscription.discountPercent}% off
                  </p>
                </div>
                <Badge tone={subscription.status === "active" ? "success" : "neutral"}>{subscription.status}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["Pause", "Resume", "Skip next delivery", "Change date", "Change address", "Change flavor", "Cancel"].map((action) => (
                  <button className="focus-ring rounded-md border border-black/10 bg-white px-3 py-2 text-xs font-black text-ink" key={action} type="button">
                    {action}
                  </button>
                ))}
              </div>
              <p className="mt-3 text-xs font-semibold text-slate">Subscription reminder placeholder enabled.</p>
            </div>
          ))}
      </div>
    ),
    wishlist: (
      <div className="grid gap-3">
        {wishlistProducts.map((product) => (
          <Link className="rounded-md border border-black/10 p-3 text-sm font-black text-ink hover:border-forest" href={`/products/${product.slug}`} key={product.id}>
            {product.name}
          </Link>
        ))}
      </div>
    )
  };

  return (
    <section className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Settings className="h-5 w-5 text-forest" />
        <h1 className="text-2xl font-black capitalize tracking-tight text-ink">{section.replace("-", " ")}</h1>
      </div>
      <div className="mt-5">{content[section] ?? <p className="text-sm text-slate">Account section placeholder.</p>}</div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}

function ActionCard({ icon, label, text }: { icon: ReactNode; label: string; text: string }) {
  return (
    <div className="rounded-md border border-black/10 p-4">
      <div className="text-forest">{icon}</div>
      <p className="mt-3 font-black text-ink">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate">{text}</p>
    </div>
  );
}
