import type { CartLineItem, CartTotals } from "@/types/cart";
import type { ReactNode } from "react";
import { formatRs } from "@/lib/cart/cartPricing";

export function CartSummaryCard({
  action,
  items,
  totals
}: {
  action?: ReactNode;
  items: CartLineItem[];
  totals: CartTotals;
}) {
  const remainingForFreeShipping = Math.max(0, totals.freeShippingThreshold - totals.subtotal);
  const progress = Math.min(100, Math.round((totals.subtotal / totals.freeShippingThreshold) * 100));

  return (
    <aside className="rounded-card border border-black/10 bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-extrabold tracking-tight text-ink">Order summary</h2>
        <span className="rounded-md bg-mint px-2 py-1 text-xs font-black text-forest">Secure</span>
      </div>
      <div className="mt-4 rounded-md border border-black/10 bg-mist p-3">
        <div className="h-2 overflow-hidden rounded-full bg-cloud">
          <div className="h-full rounded-full bg-lime" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-2 text-xs font-bold text-slate">
          {remainingForFreeShipping > 0
            ? `Add ${formatRs(remainingForFreeShipping)} more for free shipping.`
            : "Free shipping unlocked."}
        </p>
      </div>
      <div className="mt-4 grid gap-3 text-sm">
        <SummaryRow label={`Subtotal (${totals.itemCount} items)`} value={formatRs(totals.subtotal)} />
        <SummaryRow label="Product discount" value={`- ${formatRs(totals.productDiscount)}`} />
        <SummaryRow label="Coupon discount" value={`- ${formatRs(totals.couponDiscount)}`} />
        <SummaryRow label="Subscribe & Save" value={`- ${formatRs(totals.subscriptionDiscount)}`} />
        <SummaryRow label="Loyalty redemption" value={`- ${formatRs(totals.loyaltyRedeemedAmount)}`} />
        <SummaryRow label="Shipping" value={totals.shipping === 0 ? "Free" : formatRs(totals.shipping)} />
        <SummaryRow label="Tax" value="Calculated later" />
      </div>
      <div className="mt-5 border-t border-black/10 pt-4">
        <SummaryRow label="Grand total" strong value={formatRs(totals.grandTotal)} />
        {items.some((item) => item.purchaseType === "subscribe") ? (
          <p className="mt-2 text-xs font-semibold text-forest">
            Subscription items keep their frequency in the order payload.
          </p>
        ) : null}
        <p className="mt-2 text-xs font-semibold text-slate">
          Earn {totals.loyaltyEarnedPoints} loyalty points on this order.
        </p>
        <p className="mt-3 rounded-md bg-mist px-3 py-2 text-xs font-bold text-slate">
          Payments are encrypted and processed online through the secure gateway.
        </p>
      </div>
      {action ? <div className="mt-5">{action}</div> : null}
    </aside>
  );
}

function SummaryRow({ label, strong, value }: { label: string; strong?: boolean; value: string }) {
  return (
    <div className={`flex items-center justify-between gap-4 ${strong ? "text-lg font-extrabold" : "font-medium"}`}>
      <span className={strong ? "text-ink" : "text-slate"}>{label}</span>
      <span className="text-right text-ink">{value}</span>
    </div>
  );
}
