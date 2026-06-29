"use client";

import Link from "next/link";
import { AlertTriangle, PackageSearch, SearchX } from "lucide-react";
import { customers, inventoryBatches, orders, products } from "@/mock";
import { batches } from "@/mock/inventory";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";

const formatRs = (value: number) => `Rs ${value.toLocaleString("en-IN")}`;

export function AdminDashboardClient() {
  const todayRevenue = orders.reduce((total, order) => total + order.totalAmount, 0);
  const averageOrderValue = orders.length > 0 ? Math.round(todayRevenue / orders.length) : 0;
  const lowStockRows = inventoryBatches.filter((batch) => batch.availableStock <= batch.lowStockThreshold);
  const expiringSoonBatches = batches.filter((batch) => new Date(batch.expiryDate).getFullYear() <= 2027);
  const pendingOrders = orders.filter((order) => ["pending", "confirmed"].includes(order.status)).length;
  const codPendingOrders = 2;
  const returnRequests = 1;
  const subscriptionRenewals = 7;
  const topSellingProducts = [...products]
    .map((product) => ({
      name: product.name,
      revenue: product.variants.reduce((total, variant) => total + variant.sellingPrice * Math.max(1, Math.round(variant.stock / 20)), 0),
      units: product.variants.reduce((total, variant) => total + Math.max(1, Math.round(variant.stock / 20)), 0)
    }))
    .sort((a, b) => b.revenue - a.revenue);

  return (
    <div className="grid gap-6">
      <section className="rounded-card border border-black/10 bg-ink p-5 text-white shadow-card">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-lime">Operations overview</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Revenue, inventory, and fulfillment signals in one place</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
              Monitor today&apos;s store health, stock risks, order queues, and customer activity before making catalog or fulfillment decisions.
            </p>
          </div>
          <Link className="inline-flex h-11 items-center justify-center rounded-md bg-lime px-4 text-sm font-semibold text-ink" href="/admin/orders">
            Review orders
          </Link>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        <StatCard label="Today revenue" value={formatRs(todayRevenue)} tone="forest" />
        <StatCard label="Total orders" value={orders.length} />
        <StatCard label="Pending orders" value={pendingOrders} tone="coral" />
        <StatCard label="Total customers" value={customers.length} />
        <StatCard label="Avg order value" value={formatRs(averageOrderValue)} />
        <StatCard label="Low stock products" value={lowStockRows.length} tone="coral" />
        <StatCard label="Expiring soon" value={expiringSoonBatches.length} tone="coral" />
        <StatCard label="Return requests" value={returnRequests} />
        <StatCard label="COD pending" value={codPendingOrders} tone="coral" />
        <StatCard label="Renewals" value={subscriptionRenewals} />
        <StatCard label="Top sellers" value={topSellingProducts.length} />
        <StatCard label="No-result searches" value="12" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminCard title="Revenue trend">
          <div className="flex min-h-72 items-end gap-3 rounded-md bg-mist p-4">
            {[42, 68, 56, 82, 74, 95, 88].map((height, index) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={height}>
                <div className="w-full rounded-t-md bg-forest shadow-sm" style={{ height: `${height * 2}px` }} />
                <span className="text-xs font-bold text-slate">D{index + 1}</span>
              </div>
            ))}
          </div>
        </AdminCard>
        <AdminCard title="Orders by status">
          <div className="grid gap-3">
            {["pending", "paid", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned", "refunded"].map((status) => (
              <div className="grid grid-cols-[100px_1fr_36px] items-center gap-3 text-sm" key={status}>
                <span className="font-black capitalize text-ink">{status}</span>
                <div className="h-2 overflow-hidden rounded-full bg-cloud">
                  <div className="h-full rounded-full bg-lime" style={{ width: `${status === "confirmed" ? 70 : 18}%` }} />
                </div>
                <span className="text-right font-bold text-slate">{status === "confirmed" ? orders.length : status === "pending" ? 1 : 0}</span>
              </div>
            ))}
          </div>
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Top products">
          <AdminTable
            columns={["Product", "Units", "Revenue"]}
            rows={topSellingProducts.map((product) => [
              <span className="font-black text-ink" key="name">{product.name}</span>,
              product.units,
              formatRs(product.revenue)
            ])}
          />
        </AdminCard>
        <AdminCard title="Recent orders">
          <AdminTable
            columns={["Order", "Customer", "Status", "Total"]}
            rows={orders.map((order) => [
              <Link className="font-black text-forest" href="/admin/orders" key="order">{order.orderNumber}</Link>,
              customers.find((customer) => customer.id === order.customerId)?.email ?? "Guest",
              <Badge key="status" tone="success">{order.status}</Badge>,
              formatRs(order.totalAmount)
            ])}
          />
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Low stock">
          <AdminTable
            columns={["SKU", "Batch", "Available", "Threshold"]}
            rows={lowStockRows.map((item) => [
              <span className="font-black text-ink" key="sku">{variantSku(item.productVariantId)}</span>,
              item.batchNumber,
              <span className="text-coral font-black" key="stock">{item.availableStock}</span>,
              item.lowStockThreshold
            ])}
          />
        </AdminCard>
        <AdminCard title="Expiry alerts">
          <AdminTable
            columns={["Batch", "SKU", "Expiry", "Alert"]}
            rows={expiringSoonBatches.map((batch) => [
              batch.batchNumber,
              variantSku(batch.productVariantId),
              batch.expiryDate,
              <Badge key="alert" tone="sale">Review</Badge>
            ])}
          />
        </AdminCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminCard>
          <div className="flex items-start gap-3">
            <PackageSearch className="h-5 w-5 text-forest" />
            <div>
              <h2 className="font-black text-ink">Top selling products</h2>
              <p className="mt-1 text-sm leading-6 text-slate">
                Products are ranked by current sales velocity and stock availability so buying decisions stay focused.
              </p>
            </div>
          </div>
        </AdminCard>
        <AdminCard>
          <div className="flex items-start gap-3">
            <SearchX className="h-5 w-5 text-coral" />
            <div>
              <h2 className="font-black text-ink">No-result search terms</h2>
              <p className="mt-1 text-sm leading-6 text-slate">
                Track searches such as isolate 5lb, vegan mass gainer, and lactose-free pre-workout to plan catalog gaps.
              </p>
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard>
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-coral" />
          <div>
            <h2 className="font-black text-ink">Operational alerts</h2>
            <p className="mt-1 text-sm leading-6 text-slate">
              Low stock, expiry, COD, return, and subscription renewal alerts are separated so each can become a real admin queue.
            </p>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}

function variantSku(variantId: string) {
  return products.flatMap((product) => product.variants).find((variant) => variant.id === variantId)?.sku ?? variantId;
}
