"use client";

import { BellRing, Mail, MessageCircle, Smartphone } from "lucide-react";
import { useState } from "react";
import {
  abandonedCartLeads,
  marketingAutomationRules,
  productAlertSignups
} from "@/mock/engagement";
import { subscriptions } from "@/mock/promotions";
import { formatRs } from "@/lib/cart/cartPricing";
import { getAutomationStats } from "@/lib/engagement/engagementService";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import type { MarketingAutomationRule } from "@/types/engagement";
import { Badge } from "@/components/ui/Badge";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";

const triggerLabels: Record<MarketingAutomationRule["trigger"], string> = {
  abandoned_cart: "Abandoned cart",
  back_in_stock_alert: "Back in stock alert",
  birthday_coupon: "Birthday coupon",
  delivered_message: "Delivered message",
  order_confirmation: "Order confirmation",
  price_drop_alert: "Price drop alert",
  reorder_reminder: "Reorder reminder",
  review_request: "Review request",
  shipping_update: "Shipping update",
  subscription_renewal_reminder: "Subscription renewal reminder",
  win_back_campaign: "Win-back campaign"
};

export function MarketingAutomationClient() {
  const { session } = useAdminSession();
  const [rules, setRules] = useState(marketingAutomationRules);
  const [toast, setToast] = useState("");
  const stats = getAutomationStats();

  function updateRule(ruleId: string, status: MarketingAutomationRule["status"]) {
    setRules((current) => current.map((rule) => (rule.id === ruleId ? { ...rule, status } : rule)));
    writeAdminAuditLog(session, {
      action: "admin.marketing.automation.status",
      entityId: ruleId,
      entityType: "MarketingAutomationRule",
      metadata: { status }
    });
    setToast(`Automation ${status}.`);
  }

  function createRule() {
    const nextRule: MarketingAutomationRule = {
      id: `auto-custom-${Date.now()}`,
      name: "Custom automation draft",
      trigger: "win_back_campaign",
      channels: ["email"],
      status: "draft",
      audienceSegment: "inactive",
      delayHours: 24,
      sentCount: 0
    };
    setRules((current) => [nextRule, ...current]);
    setToast("Automation draft created.");
  }

  return (
    <div className="grid gap-6">
      {toast ? <Toast message={toast} onDismiss={() => setToast("")} /> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Active automations" value={String(stats.active)} />
        <Metric label="Paused" value={String(stats.paused)} />
        <Metric label="Sent" value={stats.sent.toLocaleString("en-IN")} />
        <Metric label="Revenue placeholder" value={formatRs(stats.revenue)} />
      </div>

      <AdminCard title="Campaign and automation rules">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate">
            Email, SMS, and WhatsApp provider integrations are placeholders with audit-ready admin controls.
          </p>
          <button className="admin-action justify-center" onClick={createRule} type="button">Create automation rule</button>
        </div>
        <AdminTable
          columns={["Campaign", "Trigger", "Channels", "Status", "Performance", "Actions"]}
          rows={rules.map((rule) => [
            <div key="name">
              <p className="font-black text-ink">{rule.name}</p>
              <p className="mt-1 text-xs font-semibold text-slate">
                Segment: {rule.audienceSegment} - delay {rule.delayHours}h
              </p>
            </div>,
            triggerLabels[rule.trigger],
            <div className="flex flex-wrap gap-2" key="channels">{rule.channels.map((channel) => <ChannelBadge channel={channel} key={channel} />)}</div>,
            <Badge key="status" tone={rule.status === "active" ? "success" : rule.status === "paused" ? "sale" : "neutral"}>{rule.status}</Badge>,
            <div className="grid gap-1 text-xs font-bold text-slate" key="performance">
              <span>Sent: {rule.sentCount.toLocaleString("en-IN")}</span>
              <span>Open: {rule.openRatePercent ?? 0}%</span>
              <span>Click: {rule.clickRatePercent ?? 0}%</span>
              <span>Revenue: {formatRs(rule.revenueAttributed ?? 0)}</span>
            </div>,
            <div className="flex flex-wrap gap-2" key="actions">
              <button className="admin-action" onClick={() => updateRule(rule.id, "active")} type="button">Activate</button>
              <button className="admin-action" onClick={() => updateRule(rule.id, "paused")} type="button">Pause</button>
              <button className="admin-action" onClick={() => updateRule(rule.id, "draft")} type="button">Draft</button>
            </div>
          ])}
        />
      </AdminCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Abandoned cart list">
          <div className="grid gap-3">
            {abandonedCartLeads.map((lead) => (
              <div className="rounded-md border border-black/10 p-4" key={lead.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-ink">{lead.customerName}</p>
                    <p className="mt-1 text-sm font-semibold text-slate">{lead.itemCount} items - {formatRs(lead.cartValue)}</p>
                  </div>
                  <Badge>{lead.lastActivityAt}</Badge>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {lead.channelsQueued.map((channel) => <ChannelBadge channel={channel} key={channel} />)}
                </div>
              </div>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="Reorder and subscription reminders">
          <div className="grid gap-3">
            {subscriptions.map((subscription) => (
              <div className="rounded-md border border-black/10 p-4" key={subscription.id}>
                <div className="flex flex-wrap justify-between gap-3">
                  <div>
                    <p className="font-black text-ink">{subscription.productId}</p>
                    <p className="mt-1 text-sm font-semibold text-slate">
                      {subscription.frequency} - next {subscription.nextDeliveryDate}
                    </p>
                  </div>
                  <Badge tone={subscription.status === "active" ? "success" : "neutral"}>{subscription.status}</Badge>
                </div>
                <p className="mt-3 text-xs font-bold text-slate">
                  Subscription renewal reminder and payment retry placeholders ready.
                </p>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Back-in-stock and price-drop alert signups">
        <AdminTable
          columns={["Product", "Customer", "Alert", "Channel", "Status"]}
          rows={productAlertSignups.map((signup) => [
            signup.productName,
            signup.customerEmail,
            signup.type === "back_in_stock" ? "Back in stock" : `Price drop${signup.targetPrice ? ` below ${formatRs(signup.targetPrice)}` : ""}`,
            <ChannelBadge channel={signup.channel} key="channel" />,
            <Badge key="status" tone={signup.status === "active" ? "success" : "neutral"}>{signup.status}</Badge>
          ])}
        />
      </AdminCard>
    </div>
  );
}

function ChannelBadge({ channel }: { channel: "email" | "SMS" | "WhatsApp" }) {
  const icon = channel === "email" ? <Mail className="h-3 w-3" /> : channel === "SMS" ? <Smartphone className="h-3 w-3" /> : <MessageCircle className="h-3 w-3" />;
  return <Badge tone="neutral">{icon}{channel}</Badge>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-card border border-black/10 bg-white p-4 text-sm font-bold text-ink shadow-card">
      <BellRing className="h-5 w-5 text-forest" />
      <span>{message}</span>
      <button className="ml-auto text-slate" onClick={onDismiss} type="button">Dismiss</button>
    </div>
  );
}
