"use client";

import { useEffect, useMemo, useState } from "react";
import { Gift, Percent, Plus, RefreshCw, Save, Ticket, Users } from "lucide-react";
import { bundleDeals, couponRules, loyaltyPointEntries, promotionRules, referralRecords, subscriptions } from "@/mock/promotions";
import type { CouponRule, CustomerSubscription } from "@/types/promotions";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { adminJsonHeaders } from "@/lib/admin/adminApiClient";
import { showDemoData } from "@/lib/admin/liveData";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import { formatRs } from "@/lib/cart/cartPricing";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";

const tabs = ["Coupons", "Promotions", "Bundles", "Subscriptions", "Loyalty", "Referrals", "Reports"] as const;
type PromoTab = (typeof tabs)[number];

export function PromotionsManagementClient() {
  if (!showDemoData) {
    return <LiveCouponManagementClient />;
  }

  return <DemoPromotionsManagementClient />;
}

type LiveCoupon = {
  code: string;
  endsAt: string | null;
  id: string;
  isActive: boolean;
  minimumOrderAmount: number | null;
  startsAt: string;
  timesUsed: number;
  type: "PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING";
  usageLimit: number | null;
  value: number;
};

const liveCouponDraftInitial = {
  code: "",
  endsAt: "",
  minimumOrderAmount: 0,
  type: "PERCENTAGE" as LiveCoupon["type"],
  usageLimit: 0,
  value: 10
};

function LiveCouponManagementClient() {
  const { session } = useAdminSession();
  const [coupons, setCoupons] = useState<LiveCoupon[]>([]);
  const [draft, setDraft] = useState(liveCouponDraftInitial);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadCoupons() {
    setIsLoading(true);

    try {
      const response = await fetch("/api/admin/coupons", { headers: adminJsonHeaders(session) });
      const result = (await response.json().catch(() => ({}))) as { data?: LiveCoupon[] };
      setCoupons(Array.isArray(result.data) ? result.data : []);
      setError("");
    } catch {
      setError("Unable to load coupons from the database.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadCoupons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createCoupon() {
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/coupons", {
        body: JSON.stringify({
          code: draft.code,
          endsAt: draft.endsAt || undefined,
          minimumOrderAmount: draft.minimumOrderAmount > 0 ? draft.minimumOrderAmount : undefined,
          type: draft.type,
          usageLimit: draft.usageLimit > 0 ? draft.usageLimit : undefined,
          value: draft.type === "FREE_SHIPPING" ? 0 : draft.value
        }),
        headers: adminJsonHeaders(session, true),
        method: "POST"
      });
      const result = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setError(result.message ?? "Unable to create coupon.");
        return;
      }

      setMessage(result.message ?? "Coupon created.");
      setDraft(liveCouponDraftInitial);
      writeAdminAuditLog(session, {
        action: "admin.coupon.create",
        entityId: draft.code.toUpperCase(),
        entityType: "Coupon"
      });
      await loadCoupons();
    } catch {
      setError("Unable to create coupon.");
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleCoupon(coupon: LiveCoupon) {
    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, {
        body: JSON.stringify({ isActive: !coupon.isActive }),
        headers: adminJsonHeaders(session, true),
        method: "PATCH"
      });
      const result = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setError(result.message ?? "Unable to update coupon.");
        return;
      }

      setCoupons((current) => current.map((item) => (item.id === coupon.id ? { ...item, isActive: !coupon.isActive } : item)));
      setMessage(result.message ?? "Coupon updated.");
    } catch {
      setError("Unable to update coupon.");
    }
  }

  async function deleteCoupon(coupon: LiveCoupon) {
    if (!window.confirm(`Delete coupon ${coupon.code}?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/coupons/${coupon.id}`, { headers: adminJsonHeaders(session), method: "DELETE" });
      const result = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setError(result.message ?? "Unable to delete coupon.");
        return;
      }

      setCoupons((current) => current.filter((item) => item.id !== coupon.id));
      setMessage(`Coupon ${coupon.code} deleted.`);
    } catch {
      setError("Unable to delete coupon.");
    }
  }

  return (
    <div className="grid gap-6">
      <AdminCard
        action={<Badge tone="success">MongoDB live coupons</Badge>}
        description="Create discount codes for the storefront checkout."
        title="Create coupon"
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <Input label="Coupon code" onChange={(event) => setDraft((current) => ({ ...current, code: event.target.value.toUpperCase() }))} placeholder="WELCOME10" value={draft.code} />
          <Select label="Discount type" onChange={(event) => setDraft((current) => ({ ...current, type: event.target.value as LiveCoupon["type"] }))} value={draft.type}>
            <option value="PERCENTAGE">Percentage off</option>
            <option value="FIXED_AMOUNT">Fixed amount off</option>
            <option value="FREE_SHIPPING">Free shipping</option>
          </Select>
          {draft.type !== "FREE_SHIPPING" ? (
            <Input label={draft.type === "PERCENTAGE" ? "Discount %" : "Discount amount (Rs)"} min={0} onChange={(event) => setDraft((current) => ({ ...current, value: Number(event.target.value) }))} type="number" value={draft.value} />
          ) : null}
          <Input helperText="0 means no minimum." label="Minimum order amount (Rs)" min={0} onChange={(event) => setDraft((current) => ({ ...current, minimumOrderAmount: Number(event.target.value) }))} type="number" value={draft.minimumOrderAmount} />
          <Input helperText="0 means unlimited." label="Usage limit" min={0} onChange={(event) => setDraft((current) => ({ ...current, usageLimit: Number(event.target.value) }))} type="number" value={draft.usageLimit} />
          <Input label="Expires on (optional)" onChange={(event) => setDraft((current) => ({ ...current, endsAt: event.target.value }))} type="date" value={draft.endsAt} />
        </div>
        {error ? <p className="mt-4 rounded-md bg-coral/10 p-3 text-sm font-bold text-coral" role="alert">{error}</p> : null}
        {message ? <p className="mt-4 rounded-md bg-mint p-3 text-sm font-bold text-forest" role="status">{message}</p> : null}
        <div className="mt-5 flex justify-end">
          <button
            className="admin-action bg-ink text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSaving || draft.code.trim().length < 3}
            onClick={() => void createCoupon()}
            type="button"
          >
            <Plus className="h-4 w-4" /> {isSaving ? "Creating..." : "Create coupon"}
          </button>
        </div>
      </AdminCard>
      <AdminCard description="All storefront discount codes with usage." title={`Coupons (${coupons.length})`}>
        {isLoading ? (
          <p className="rounded-md bg-mist p-4 text-sm font-semibold text-slate">Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <p className="rounded-md bg-mist p-4 text-sm font-semibold text-slate">No coupons yet. Create your first discount code above.</p>
        ) : (
          <AdminTable
            columns={["Code", "Discount", "Min order", "Used", "Expires", "Status", "Actions"]}
            rows={coupons.map((coupon) => [
              <span className="font-black text-ink" key="code">{coupon.code}</span>,
              coupon.type === "PERCENTAGE" ? `${coupon.value}%` : coupon.type === "FIXED_AMOUNT" ? formatRs(coupon.value) : "Free shipping",
              coupon.minimumOrderAmount ? formatRs(coupon.minimumOrderAmount) : "-",
              `${coupon.timesUsed}${coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}`,
              coupon.endsAt ? new Date(coupon.endsAt).toLocaleDateString("en-IN", { dateStyle: "medium" }) : "Never",
              <Badge key="status" tone={coupon.isActive ? "success" : "neutral"}>{coupon.isActive ? "Active" : "Inactive"}</Badge>,
              <div className="flex gap-2" key="actions">
                <button className="admin-action" onClick={() => void toggleCoupon(coupon)} type="button">
                  {coupon.isActive ? "Deactivate" : "Activate"}
                </button>
                <button className="admin-action text-coral" onClick={() => void deleteCoupon(coupon)} type="button">
                  Delete
                </button>
              </div>
            ])}
          />
        )}
      </AdminCard>
    </div>
  );
}

function DemoPromotionsManagementClient() {
  const { session } = useAdminSession();
  const [activeTab, setActiveTab] = useState<PromoTab>("Coupons");
  const [coupons, setCoupons] = useState(couponRules);
  const [subscriptionRows, setSubscriptionRows] = useState(subscriptions);
  const [toast, setToast] = useState("");
  const [draft, setDraft] = useState({
    code: "STACK15",
    discountType: "percentage" as CouponRule["discountType"],
    minimumOrderValue: 2499,
    value: 15
  });

  const report = useMemo(
    () => ({
      activeCoupons: coupons.filter((coupon) => coupon.active).length,
      activePromotions: promotionRules.filter((promotion) => promotion.active).length,
      bundleRevenue: bundleDeals.reduce((sum, bundle) => sum + bundle.bundlePrice, 0),
      upcomingRenewals: subscriptionRows.filter((subscription) => subscription.status === "active").length
    }),
    [coupons, subscriptionRows]
  );

  function audit(action: string, entityId?: string) {
    writeAdminAuditLog(session, {
      action,
      entityId,
      entityType: "promotion",
      metadata: { activeTab }
    });
  }

  function createCoupon() {
    const nextCoupon: CouponRule = {
      abusePreventionNote: "Placeholder: flag suspicious reuse by customer, phone, payment method, and device later.",
      active: true,
      code: draft.code.trim().toUpperCase(),
      customerGroup: "all",
      description: "Admin-created coupon.",
      discountType: draft.discountType,
      firstOrderOnly: false,
      id: `coupon-${Date.now()}`,
      minimumOrderValue: Number(draft.minimumOrderValue),
      perCustomerLimit: 1,
      startDate: "2026-06-29",
      usageCount: 0,
      usageLimit: 250,
      value: Number(draft.value)
    };

    setCoupons((current) => [nextCoupon, ...current]);
    audit("coupon.create", nextCoupon.id);
    setToast(`${nextCoupon.code} coupon created.`);
  }

  function toggleCoupon(couponId: string) {
    setCoupons((current) => current.map((coupon) => (coupon.id === couponId ? { ...coupon, active: !coupon.active } : coupon)));
    audit("coupon.toggle", couponId);
    setToast("Coupon status updated.");
  }

  function updateSubscription(subscriptionId: string, status: CustomerSubscription["status"]) {
    setSubscriptionRows((current) => current.map((subscription) => (subscription.id === subscriptionId ? { ...subscription, status } : subscription)));
    audit(`subscription.${status}`, subscriptionId);
    setToast(`Subscription ${status.replace("_", " ")}.`);
  }

  return (
    <div className="space-y-6">
      {toast ? <div className="rounded-md bg-mint px-4 py-3 text-sm font-semibold text-forest">{toast}</div> : null}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Active coupons" value={report.activeCoupons} />
        <Metric label="Active promos" value={report.activePromotions} />
        <Metric label="Bundle value" value={formatRs(report.bundleRevenue)} />
        <Metric label="Upcoming renewals" value={report.upcomingRenewals} />
      </div>
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            className={`rounded-md px-4 py-2 text-sm font-black ${activeTab === tab ? "bg-ink text-white" : "bg-white text-ink"}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Coupons" ? <CouponPanel coupons={coupons} createCoupon={createCoupon} draft={draft} setDraft={setDraft} toggleCoupon={toggleCoupon} /> : null}
      {activeTab === "Promotions" ? <PromotionPanel /> : null}
      {activeTab === "Bundles" ? <BundlePanel /> : null}
      {activeTab === "Subscriptions" ? <SubscriptionPanel rows={subscriptionRows} updateSubscription={updateSubscription} /> : null}
      {activeTab === "Loyalty" ? <LoyaltyPanel /> : null}
      {activeTab === "Referrals" ? <ReferralPanel /> : null}
      {activeTab === "Reports" ? <ReportsPanel /> : null}
    </div>
  );
}

function CouponPanel({
  coupons,
  createCoupon,
  draft,
  setDraft,
  toggleCoupon
}: {
  coupons: CouponRule[];
  createCoupon: () => void;
  draft: { code: string; discountType: CouponRule["discountType"]; minimumOrderValue: number; value: number };
  setDraft: (draft: { code: string; discountType: CouponRule["discountType"]; minimumOrderValue: number; value: number }) => void;
  toggleCoupon: (couponId: string) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
      <AdminCard title="Create coupon">
        <div className="grid gap-4">
          <Input label="Coupon code" onChange={(event) => setDraft({ ...draft, code: event.target.value })} value={draft.code} />
          <Select label="Discount type" onChange={(event) => setDraft({ ...draft, discountType: event.target.value as CouponRule["discountType"] })} value={draft.discountType}>
            <option value="percentage">Percentage</option>
            <option value="fixed_amount">Fixed amount</option>
            <option value="free_shipping">Free shipping</option>
          </Select>
          <Input label="Minimum order value" onChange={(event) => setDraft({ ...draft, minimumOrderValue: Number(event.target.value) })} type="number" value={draft.minimumOrderValue} />
          <Input label="Discount value" onChange={(event) => setDraft({ ...draft, value: Number(event.target.value) })} type="number" value={draft.value} />
          <button className="admin-action justify-center" onClick={createCoupon} type="button">
            <Plus className="h-4 w-4" /> Create coupon
          </button>
        </div>
      </AdminCard>
      <AdminCard title="Coupon rules">
        <AdminTable
          columns={["Code", "Type", "Conditions", "Usage", "Abuse guard", "Status"]}
          rows={coupons.map((coupon) => [
            <span className="inline-flex items-center gap-2 font-black text-ink" key="code"><Ticket className="h-4 w-4" /> {coupon.code}</span>,
            label(coupon.discountType),
            `Min ${formatRs(coupon.minimumOrderValue)}; ${coupon.firstOrderOnly ? "first order; " : ""}${coupon.categorySlugs?.join(", ") ?? coupon.productIds?.join(", ") ?? "sitewide"}`,
            `${coupon.usageCount}/${coupon.usageLimit}; per customer ${coupon.perCustomerLimit}`,
            coupon.abusePreventionNote,
            <button className="admin-action" key="status" onClick={() => toggleCoupon(coupon.id)} type="button">{coupon.active ? "Active" : "Inactive"}</button>
          ])}
        />
      </AdminCard>
    </div>
  );
}

function PromotionPanel() {
  return (
    <AdminCard title="Promotion system">
      <AdminTable
        columns={["Promotion", "Type", "Target", "Discount", "Performance", "Status"]}
        rows={promotionRules.map((promotion) => [
          <span className="inline-flex items-center gap-2 font-black text-ink" key="promo"><Percent className="h-4 w-4" /> {promotion.name}</span>,
          label(promotion.type),
          promotion.productIds?.join(", ") ?? promotion.categorySlugs?.join(", ") ?? promotion.brandIds?.join(", ") ?? "Order/cart rule",
          `${promotion.value}${promotion.discountType === "percentage" ? "%" : ""}`,
          `${promotion.performance.orders} orders - ${formatRs(promotion.performance.revenue)} - ${promotion.performance.conversionRate}% CVR`,
          <Badge key="status" tone={promotion.active ? "success" : "neutral"}>{promotion.active ? "Active" : "Inactive"}</Badge>
        ])}
      />
      <p className="mt-4 text-sm text-slate">Promotion types covered: product, category, brand, flash sale, Buy X Get Y, bundle discount, gift with purchase, and free shipping rule.</p>
    </AdminCard>
  );
}

function BundlePanel() {
  return (
    <AdminCard title="Bundle builder">
      <AdminTable
        columns={["Bundle", "Products", "Price", "Discount", "Image", "Card/page"]}
        rows={bundleDeals.map((bundle) => [
          <span className="inline-flex items-center gap-2 font-black text-ink" key="bundle"><Gift className="h-4 w-4" /> {bundle.title}</span>,
          bundle.productIds.join(", "),
          formatRs(bundle.bundlePrice),
          formatRs(bundle.discountAmount),
          "Upload or change image",
          `/bundles/${bundle.slug}`
        ])}
      />
    </AdminCard>
  );
}

function SubscriptionPanel({
  rows,
  updateSubscription
}: {
  rows: CustomerSubscription[];
  updateSubscription: (subscriptionId: string, status: CustomerSubscription["status"]) => void;
}) {
  return (
    <AdminCard title="Subscribe & Save">
      <AdminTable
        columns={["Subscription", "Product/variant", "Frequency", "Next delivery", "Discount", "Admin actions"]}
        rows={rows.map((subscription) => [
          subscription.id,
          `${subscription.productId} / ${subscription.variantId}`,
          subscription.frequency,
          subscription.nextDeliveryDate,
          `${subscription.discountPercent}%`,
          <div className="flex flex-wrap gap-2" key="actions">
            <button className="admin-action" onClick={() => updateSubscription(subscription.id, "paused")} type="button">Pause</button>
            <button className="admin-action" onClick={() => updateSubscription(subscription.id, "active")} type="button">Resume</button>
            <button className="admin-action" onClick={() => updateSubscription(subscription.id, "payment_retry")} type="button"><RefreshCw className="h-4 w-4" /> Retry payment</button>
            <button className="admin-action text-coral" onClick={() => updateSubscription(subscription.id, "cancelled")} type="button">Cancel</button>
          </div>
        ])}
      />
      <p className="mt-4 text-sm text-slate">Customer controls supported in account UI: pause, resume, skip next delivery, change date/address/flavor, and cancel.</p>
    </AdminCard>
  );
}

function LoyaltyPanel() {
  return (
    <AdminCard title="Loyalty program">
      <AdminTable
        columns={["Date", "Type", "Points", "Note"]}
        rows={loyaltyPointEntries.map((entry) => [entry.at, label(entry.type), entry.points, entry.note])}
      />
      <button className="admin-action mt-4" type="button"><Save className="h-4 w-4" /> Admin points adjustment</button>
      <p className="mt-3 text-sm text-slate">Rules: earn on purchase, review, and referral; redeem at checkout; expiry and VIP segments are modeled.</p>
    </AdminCard>
  );
}

function ReferralPanel() {
  return (
    <AdminCard title="Referral system">
      <AdminTable
        columns={["Code", "Landing link", "Friend", "Rewards", "Status"]}
        rows={referralRecords.map((referral) => [
          <span className="inline-flex items-center gap-2 font-black text-ink" key="code"><Users className="h-4 w-4" /> {referral.code}</span>,
          referral.landingLink,
          referral.referredEmail,
          `${referral.referrerReward}; ${referral.friendReward}`,
          <Badge key="status" tone={referral.status === "rewarded" || referral.status === "ordered" ? "success" : "neutral"}>{label(referral.status)}</Badge>
        ])}
      />
    </AdminCard>
  );
}

function ReportsPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <AdminCard title="Coupon performance"><p className="text-sm text-slate">Usage, revenue, per-customer limits, and abuse flags.</p></AdminCard>
      <AdminCard title="Promotion performance"><p className="text-sm text-slate">Orders, conversion rate, revenue, and flash sale timer performance.</p></AdminCard>
      <AdminCard title="Referral report"><p className="text-sm text-slate">Invites, signups, first orders, rewards pending, and reward cost.</p></AdminCard>
    </div>
  );
}

function Metric({ label: title, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-card border border-black/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate">{title}</p>
      <p className="mt-2 text-2xl font-black text-ink">{value}</p>
    </div>
  );
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
