"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle2, PackageSearch, SearchX } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  customers as demoCustomers,
  inventoryBatches as demoInventoryBatches,
  orders as demoOrders,
  products as demoProducts
} from "@/mock";
import { batches as demoBatches } from "@/mock/inventory";
import { adminJsonHeaders } from "@/lib/admin/adminApiClient";
import { showDemoData } from "@/lib/admin/liveData";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import { Badge } from "@/components/ui/Badge";
import { StatCard } from "@/components/ui/StatCard";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";

const formatRs = (value: number) => `Rs ${value.toLocaleString("en-IN")}`;

type LiveDashboardOrder = {
  createdAt: string;
  customerEmail: string;
  customerName: string;
  customerPhone: string;
  discountAmount: number;
  id: string;
  itemCount: number;
  items: Array<{ id: string; productName: string; quantity: number; sku: string; totalAmount: number; unitPrice: number }>;
  orderNumber: string;
  paymentProvider: string;
  paymentStatus: string;
  shippingAmount: number;
  status: string;
  subtotal: number;
  totalAmount: number;
  trackingNumber: string | null;
};

type LiveDashboardCustomer = {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  orderCount: number;
  phone: string;
  totalSpent: number;
};

export function AdminDashboardClient() {
  const { isReady, session } = useAdminSession();
  const [liveOrders, setLiveOrders] = useState<LiveDashboardOrder[]>([]);
  const [liveCustomers, setLiveCustomers] = useState<LiveDashboardCustomer[]>([]);
  const [isLiveLoading, setIsLiveLoading] = useState(!showDemoData);
  const [liveError, setLiveError] = useState("");

  useEffect(() => {
    if (showDemoData || !isReady) {
      return;
    }

    let isMounted = true;

    async function loadLiveDashboard() {
      setIsLiveLoading(true);

      try {
        const [ordersResponse, customersResponse] = await Promise.all([
          fetch("/api/admin/orders", { headers: adminJsonHeaders(session) }),
          fetch("/api/admin/customers", { headers: adminJsonHeaders(session) })
        ]);
        const ordersResult = (await ordersResponse.json().catch(() => ({}))) as { data?: LiveDashboardOrder[] };
        const customersResult = (await customersResponse.json().catch(() => ({}))) as {
          data?: { customers?: LiveDashboardCustomer[] };
        };

        if (!isMounted) {
          return;
        }

        setLiveOrders(Array.isArray(ordersResult.data) ? ordersResult.data : []);
        setLiveCustomers(Array.isArray(customersResult.data?.customers) ? customersResult.data.customers : []);
        setLiveError("");
      } catch {
        if (isMounted) {
          setLiveError("Unable to load live dashboard orders.");
        }
      } finally {
        if (isMounted) {
          setIsLiveLoading(false);
        }
      }
    }

    void loadLiveDashboard();

    return () => {
      isMounted = false;
    };
  }, [isReady, session]);

  const orders = showDemoData ? demoOrders : liveOrders;
  const customers = showDemoData ? demoCustomers : liveCustomers;
  const products = useMemo(() => (showDemoData ? demoProducts : []), []);
  const inventoryBatches = showDemoData ? demoInventoryBatches : [];
  const batches = showDemoData ? demoBatches : [];
  const todayRevenue = orders.reduce((total, order) => total + order.totalAmount, 0);
  const averageOrderValue = orders.length > 0 ? Math.round(todayRevenue / orders.length) : 0;
  const lowStockRows = inventoryBatches.filter((batch) => batch.availableStock <= batch.lowStockThreshold);
  const expiringSoonBatches = batches.filter((batch) => new Date(batch.expiryDate).getFullYear() <= 2027);
  const pendingOrders = orders.filter((order) => ["pending", "confirmed"].includes(order.status.toLowerCase())).length;
  const paymentPendingOrders = orders.filter((order) => {
    if (!("paymentStatus" in order)) {
    return order.payment?.status === "pending";
    }

    return order.paymentStatus.toLowerCase() === "pending";
  }).length;
  const returnRequests = showDemoData ? 1 : 0;
  const subscriptionRenewals = showDemoData ? 7 : 0;
  const topSellingProducts = useMemo(() => {
    if (!showDemoData) {
      const byProduct = new Map<string, { name: string; revenue: number; units: number }>();

      liveOrders.forEach((order) => {
        order.items.forEach((item) => {
          const current = byProduct.get(item.productName) ?? { name: item.productName, revenue: 0, units: 0 };
          byProduct.set(item.productName, {
            ...current,
            revenue: current.revenue + item.totalAmount,
            units: current.units + item.quantity
          });
        });
      });

      return [...byProduct.values()].sort((a, b) => b.revenue - a.revenue);
    }

    return [...products]
      .map((product) => ({
        name: product.name,
        revenue: product.variants.reduce((total, variant) => total + variant.sellingPrice * Math.max(1, Math.round(variant.stock / 20)), 0),
        units: product.variants.reduce((total, variant) => total + Math.max(1, Math.round(variant.stock / 20)), 0)
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [liveOrders, products]);

  const recentOrderRows = showDemoData
    ? demoOrders.map((order) => [
        <Link className="font-black text-forest" href="/admin/orders" key="order">{order.orderNumber}</Link>,
        demoCustomers.find((customer) => customer.id === order.customerId)?.email ?? "Guest",
        <Badge key="status" tone="success">{order.status}</Badge>,
        formatRs(order.totalAmount)
      ])
    : liveOrders.map((order) => [
        <Link className="font-black text-forest" href="/admin/orders" key="order">{order.orderNumber}</Link>,
        order.customerEmail || order.customerName || "Guest",
        <Badge key="status" tone="success">{order.status.toLowerCase()}</Badge>,
        formatRs(order.totalAmount)
      ]);

  return (
    <div className="grid gap-6">
      <section className="rounded-card border border-black/10 bg-ink p-5 text-white shadow-card">
        <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-lime">{showDemoData ? "Demo operations overview" : "Live operations overview"}</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">A clean command center for launch-day decisions</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/70">
              Monitor revenue, stock risks, order queues, and customer activity without showing sample data on the live admin panel.
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
        <StatCard label="Payment pending" value={paymentPendingOrders} tone="coral" />
        <StatCard label="Renewals" value={subscriptionRenewals} />
        <StatCard label="Top sellers" value={topSellingProducts.length} />
        <StatCard label="No-result searches" value={showDemoData ? "12" : "0"} />
      </div>

      {!showDemoData && liveError ? (
        <p className="rounded-md bg-coral/10 p-3 text-sm font-bold text-coral" role="alert">{liveError}</p>
      ) : null}

      {!showDemoData ? (
        <AdminCard title="Launch readiness" description="Demo records are hidden. Connect real catalog, order, and customer sources when you are ready to operate from this panel.">
          <div className="grid gap-3 md:grid-cols-3">
            {["MongoDB connection configured", "Private admin login configured", "Demo admin data disabled"].map((item) => (
              <div className="flex items-center gap-3 rounded-md border border-black/10 bg-mist p-4" key={item}>
                <CheckCircle2 className="h-5 w-5 shrink-0 text-forest" />
                <p className="text-sm font-black text-ink">{item}</p>
              </div>
            ))}
          </div>
        </AdminCard>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <AdminCard title="Revenue trend">
          <div className="flex min-h-72 items-end gap-3 rounded-md bg-mist p-4">
            {(showDemoData ? [42, 68, 56, 82, 74, 95, 88] : [4, 4, 4, 4, 4, 4, 4]).map((height, index) => (
              <div className="flex flex-1 flex-col items-center gap-2" key={`${height}-${index}`}>
                <div className="w-full rounded-t-md bg-forest shadow-sm" style={{ height: `${height * 2}px` }} />
                <span className="text-xs font-bold text-slate">D{index + 1}</span>
              </div>
            ))}
          </div>
        </AdminCard>
        <AdminCard title="Orders by status">
          <div className="grid gap-3">
            {["pending", "paid", "confirmed", "packed", "shipped", "delivered", "cancelled", "returned", "refunded"].map((status) => {
              const count = orders.filter((order) => order.status.toLowerCase() === status).length;
              const width = orders.length > 0 ? Math.max(8, Math.round((count / orders.length) * 100)) : 0;

              return (
                <div className="grid grid-cols-[100px_1fr_36px] items-center gap-3 text-sm" key={status}>
                  <span className="font-black capitalize text-ink">{status}</span>
                  <div className="h-2 overflow-hidden rounded-full bg-cloud">
                    <div className="h-full rounded-full bg-lime" style={{ width: `${width}%` }} />
                  </div>
                  <span className="text-right font-bold text-slate">{count}</span>
                </div>
              );
            })}
          </div>
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Top products">
          <AdminTable
            columns={["Product", "Units", "Revenue"]}
            emptyText="No live product sales yet."
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
            emptyText={isLiveLoading ? "Loading live orders..." : "No live orders yet."}
            rows={recentOrderRows}
          />
        </AdminCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Low stock">
          <AdminTable
            columns={["SKU", "Batch", "Available", "Threshold"]}
            emptyText="No low-stock live inventory yet."
            rows={lowStockRows.map((item) => [
              <span className="font-black text-ink" key="sku">{variantSku(item.productVariantId, products)}</span>,
              item.batchNumber,
              <span className="font-black text-coral" key="stock">{item.availableStock}</span>,
              item.lowStockThreshold
            ])}
          />
        </AdminCard>
        <AdminCard title="Expiry alerts">
          <AdminTable
            columns={["Batch", "SKU", "Expiry", "Alert"]}
            emptyText="No expiry alerts yet."
            rows={expiringSoonBatches.map((batch) => [
              batch.batchNumber,
              variantSku(batch.productVariantId, products),
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
                Track zero-result searches after launch to plan catalog gaps from real customer intent.
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

function variantSku(variantId: string, products: typeof demoProducts) {
  return products.flatMap((product) => product.variants).find((variant) => variant.id === variantId)?.sku ?? variantId;
}
