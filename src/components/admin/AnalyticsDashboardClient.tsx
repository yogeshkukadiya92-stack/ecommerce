"use client";

import { BarChart3, Download, FileSpreadsheet, Loader2, SearchX } from "lucide-react";
import { useMemo, useState } from "react";
import {
  buildAnalyticsReport,
  databaseOptimizationNotes,
  defaultReportRange
} from "@/lib/reports/reportingService";
import { showDemoData } from "@/lib/admin/liveData";
import type { ReportDateRange } from "@/types/reports";
import { Badge } from "@/components/ui/Badge";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";
import { LiveAdminEmptyState } from "./LiveAdminEmptyState";

const tabs = [
  "Sales",
  "Products",
  "Categories",
  "Brands",
  "Customers",
  "Inventory",
  "Orders",
  "Coupons",
  "Subscriptions",
  "Search",
  "Database Notes"
] as const;

type AnalyticsTab = (typeof tabs)[number];

const formatRs = (value: number) => `Rs ${Math.round(value).toLocaleString("en-IN")}`;

export function AnalyticsDashboardClient() {
  if (!showDemoData) {
    return (
      <LiveAdminEmptyState
        actionHref="/admin/settings"
        actionLabel="Configure reporting"
        title="Analytics will populate from live store activity"
        description="Sample revenue, customer, product, coupon, and search reports are hidden. After launch, connect reporting queries to MongoDB or your analytics provider."
      />
    );
  }

  return <DemoAnalyticsDashboardClient />;
}

function DemoAnalyticsDashboardClient() {
  const [range, setRange] = useState<ReportDateRange>(defaultReportRange);
  const [activeTab, setActiveTab] = useState<AnalyticsTab>("Sales");
  const [toast, setToast] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const report = useMemo(() => buildAnalyticsReport(range), [range]);

  function updateRange(key: keyof ReportDateRange, value: string) {
    setRange((current) => ({ ...current, [key]: value }));
  }

  function refreshReports() {
    setIsLoading(true);
    window.setTimeout(() => {
      setIsLoading(false);
      setToast("Reports refreshed.");
    }, 450);
  }

  function exportPlaceholder(type: "CSV" | "Excel") {
    setToast(`${type} export queued for ${range.startDate} to ${range.endDate}.`);
  }

  return (
    <div className="grid gap-6">
      {toast ? <Toast message={toast} onDismiss={() => setToast("")} /> : null}

      <AdminCard title="Report controls">
        <div className="grid gap-3 md:grid-cols-[1fr_1fr_auto_auto_auto] md:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Start date</span>
            <input
              className="focus-ring h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-bold text-ink"
              onChange={(event) => updateRange("startDate", event.target.value)}
              type="date"
              value={range.startDate}
            />
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">End date</span>
            <input
              className="focus-ring h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-bold text-ink"
              onChange={(event) => updateRange("endDate", event.target.value)}
              type="date"
              value={range.endDate}
            />
          </label>
          <button className="admin-action h-11 justify-center" onClick={refreshReports} type="button">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <BarChart3 className="h-4 w-4" />} Refresh
          </button>
          <button className="admin-action h-11 justify-center" onClick={() => exportPlaceholder("CSV")} type="button">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button className="admin-action h-11 justify-center" onClick={() => exportPlaceholder("Excel")} type="button">
            <FileSpreadsheet className="h-4 w-4" /> Export Excel
          </button>
        </div>
      </AdminCard>

      {isLoading ? <LoadingState /> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <Metric label="Total revenue" value={formatRs(report.sales.totalRevenue)} tone="forest" />
        <Metric label="Today revenue" value={formatRs(report.sales.todayRevenue)} />
        <Metric label="Weekly revenue" value={formatRs(report.sales.weeklyRevenue)} />
        <Metric label="Monthly revenue" value={formatRs(report.sales.monthlyRevenue)} />
        <Metric label="Orders" value={String(report.sales.orderCount)} />
        <Metric label="Avg order value" value={formatRs(report.sales.averageOrderValue)} />
        <Metric label="Conversion" value={`${report.sales.conversionRatePlaceholder}%`} tone="muted" />
      </div>

      <div className="flex gap-2 overflow-x-auto rounded-card border border-black/10 bg-white p-2 shadow-sm">
        {tabs.map((tab) => (
          <button
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-black ${activeTab === tab ? "bg-ink text-white" : "bg-mist text-ink"}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Sales" ? <SalesTab report={report} /> : null}
      {activeTab === "Products" ? <ProductsTab report={report} /> : null}
      {activeTab === "Categories" ? <CategoryTab report={report} /> : null}
      {activeTab === "Brands" ? <BrandTab report={report} /> : null}
      {activeTab === "Customers" ? <CustomerTab report={report} /> : null}
      {activeTab === "Inventory" ? <InventoryTab report={report} /> : null}
      {activeTab === "Orders" ? <OrderTab report={report} /> : null}
      {activeTab === "Coupons" ? <CouponTab report={report} /> : null}
      {activeTab === "Subscriptions" ? <SubscriptionTab report={report} /> : null}
      {activeTab === "Search" ? <SearchTab report={report} /> : null}
      {activeTab === "Database Notes" ? <DatabaseNotesTab /> : null}
    </div>
  );
}

function SalesTab({ report }: { report: ReturnType<typeof buildAnalyticsReport> }) {
  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <AdminCard title="Revenue chart">
        <BarChart
          rows={[
            { label: "Today", value: report.sales.todayRevenue },
            { label: "Weekly", value: report.sales.weeklyRevenue },
            { label: "Monthly", value: report.sales.monthlyRevenue },
            { label: "Total", value: report.sales.totalRevenue }
          ]}
        />
      </AdminCard>
      <AdminCard title="Sales overview">
        <AdminTable
          columns={["Metric", "Value"]}
          rows={[
            ["Total revenue", formatRs(report.sales.totalRevenue)],
            ["Today revenue", formatRs(report.sales.todayRevenue)],
            ["Weekly revenue", formatRs(report.sales.weeklyRevenue)],
            ["Monthly revenue", formatRs(report.sales.monthlyRevenue)],
            ["Order count", report.sales.orderCount],
            ["Average order value", formatRs(report.sales.averageOrderValue)],
            ["Conversion rate", `${report.sales.conversionRatePlaceholder}%`]
          ]}
        />
      </AdminCard>
    </div>
  );
}

function ProductsTab({ report }: { report: ReturnType<typeof buildAnalyticsReport> }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-6 xl:grid-cols-2">
        <RankedTable title="Top selling products" rows={report.product.topSellingProducts} valueLabel="Revenue" valueFormat={formatRs} />
        <RankedTable title="Low selling products" rows={report.product.lowSellingProducts} valueLabel="Units" valueKey="units" />
        <RankedTable title="Highest margin products" rows={report.product.highestMarginProducts} valueLabel="Margin" valueKey="estimatedMargin" valueFormat={formatRs} />
        <RankedTable title="Most wishlisted products" rows={report.product.mostWishlistedProducts} valueLabel="Wishlists" valueKey="wishlistCount" />
        <RankedTable title="Most reviewed products" rows={report.product.mostReviewedProducts} valueLabel="Reviews" valueKey="reviewCount" />
        <AdminCard title="Out of stock products">
          {report.product.outOfStockProducts.length > 0 ? (
            <AdminTable
              columns={["Product", "Stock"]}
              rows={report.product.outOfStockProducts.map((product) => [product.label, product.stock])}
            />
          ) : (
            <EmptyState text="No out-of-stock products in the current catalog." />
          )}
        </AdminCard>
      </div>
    </div>
  );
}

function CategoryTab({ report }: { report: ReturnType<typeof buildAnalyticsReport> }) {
  return (
    <AdminCard title="Category analytics">
      <AdminTable
        columns={["Category", "Revenue", "Order count", "Conversion"]}
        rows={report.category.map((category) => [
          <span className="font-black text-ink" key="name">{category.label}</span>,
          formatRs(category.revenue),
          category.orderCount,
          `${category.conversionRatePlaceholder}%`
        ])}
      />
    </AdminCard>
  );
}

function BrandTab({ report }: { report: ReturnType<typeof buildAnalyticsReport> }) {
  return (
    <AdminCard title="Brand analytics">
      <AdminTable
        columns={["Brand", "Revenue", "Order count", "Return rate"]}
        rows={report.brand.map((brand) => [
          <span className="font-black text-ink" key="brand">{brand.label}</span>,
          formatRs(brand.revenue),
          brand.orderCount,
          `${brand.returnRatePlaceholder}%`
        ])}
      />
    </AdminCard>
  );
}

function CustomerTab({ report }: { report: ReturnType<typeof buildAnalyticsReport> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
      <Metric label="New customers" value={String(report.customer.newCustomers)} />
      <Metric label="Repeat customers" value={String(report.customer.repeatCustomers)} />
      <Metric label="VIP customers" value={String(report.customer.vipCustomers)} tone="forest" />
      <Metric label="Inactive customers" value={String(report.customer.inactiveCustomers)} tone="muted" />
      <Metric label="Avg CLV" value={formatRs(report.customer.customerLifetimeValue)} />
      <Metric label="Repeat rate" value={`${report.customer.repeatPurchaseRate}%`} />
    </div>
  );
}

function InventoryTab({ report }: { report: ReturnType<typeof buildAnalyticsReport> }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Inventory valuation" value={formatRs(report.inventory.inventoryValuation)} />
        <Metric label="Low stock" value={String(report.inventory.lowStock.length)} tone="sale" />
        <Metric label="Expiry risk" value={String(report.inventory.expiryRisk.length)} tone="sale" />
        <Metric label="Dead stock" value={String(report.inventory.deadStock.length)} tone="muted" />
        <Metric label="Stock movements" value={String(report.inventory.stockMovement.length)} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Batch-wise stock">
          <AdminTable
            columns={["Batch", "SKU", "Warehouse", "Available", "Reserved", "Expiry", "QC"]}
            rows={report.inventory.batchWiseStock.map((batch) => [
              batch.batchNumber,
              batch.sku,
              batch.warehouseName,
              batch.availableQuantity,
              batch.reservedQuantity,
              batch.expiryDate,
              <Badge key="qc" tone={batch.qcStatus === "approved" ? "success" : batch.qcStatus === "rejected" ? "sale" : "neutral"}>{batch.qcStatus}</Badge>
            ])}
          />
        </AdminCard>
        <AdminCard title="Stock movement report">
          <AdminTable
            columns={["Time", "Type", "SKU", "Batch", "Qty", "Reason"]}
            rows={report.inventory.stockMovement.map((movement) => [
              new Date(movement.at).toLocaleString("en-IN"),
              movement.type,
              movement.sku,
              movement.batchNumber,
              movement.quantity,
              movement.reason
            ])}
          />
        </AdminCard>
      </div>
    </div>
  );
}

function OrderTab({ report }: { report: ReturnType<typeof buildAnalyticsReport> }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <ObjectTable title="Orders by status" rows={report.order.ordersByStatus} />
      <ObjectTable title="Payment method report" rows={report.order.paymentMethodReport} />
      <ObjectTable title="COD vs prepaid" rows={report.order.codVsPrepaid} />
      <AdminCard title="Returns and refunds">
        <AdminTable
          columns={["Report", "Count"]}
          rows={[
            ["Cancelled orders", report.order.cancelledOrders.length],
            ["Return requests", report.order.returnRequests.length],
            ["Refund report", report.order.refundReport.length]
          ]}
        />
      </AdminCard>
      <AdminCard title="RTO report">
        <AdminTable
          columns={["Courier", "RTO count", "RTO rate"]}
          rows={report.order.rtoReport.map((item) => [item.carrier, item.rto, `${item.rtoRate}%`])}
        />
      </AdminCard>
    </div>
  );
}

function CouponTab({ report }: { report: ReturnType<typeof buildAnalyticsReport> }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <Metric label="Coupon revenue" value={formatRs(report.promotions.couponRevenue)} />
        <Metric label="Discount given" value={formatRs(report.promotions.discountGiven)} tone="sale" />
        <Metric label="Campaign ROI" value={`${report.promotions.campaignRoiPlaceholder.length} campaigns`} />
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Coupon usage">
          <AdminTable
            columns={["Coupon", "Usage", "Revenue", "Discount given"]}
            rows={report.promotions.couponUsage.map((coupon) => [
              coupon.code,
              coupon.usageCount,
              formatRs(coupon.revenue),
              formatRs(coupon.discountGiven)
            ])}
          />
        </AdminCard>
        <AdminCard title="Campaign ROI">
          <AdminTable
            columns={["Campaign", "Orders", "Revenue", "ROI"]}
            rows={report.promotions.campaignRoiPlaceholder.map((campaign) => [
              campaign.name,
              campaign.orders,
              formatRs(campaign.revenue),
              `${campaign.roi}x`
            ])}
          />
        </AdminCard>
      </div>
    </div>
  );
}

function SubscriptionTab({ report }: { report: ReturnType<typeof buildAnalyticsReport> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <Metric label="Active" value={String(report.subscription.activeSubscriptions)} tone="forest" />
      <Metric label="Paused" value={String(report.subscription.pausedSubscriptions)} />
      <Metric label="Cancelled" value={String(report.subscription.cancelledSubscriptions)} tone="sale" />
      <Metric label="Renewal revenue" value={formatRs(report.subscription.renewalRevenue)} />
      <Metric label="Churn" value={`${report.subscription.churnPlaceholder}%`} tone="muted" />
    </div>
  );
}

function SearchTab({ report }: { report: ReturnType<typeof buildAnalyticsReport> }) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <AdminCard title="Top search terms">
        <AdminTable columns={["Term", "Searches"]} rows={report.search.topTerms.map((term) => [term.term, term.count])} />
      </AdminCard>
      <AdminCard title="No-result search terms">
        <AdminTable columns={["Term", "Searches"]} rows={report.search.noResultTerms.map((term) => [term.term, term.count])} />
      </AdminCard>
      <AdminCard title="Search-to-purchase">
        <div className="flex items-start gap-3 rounded-md bg-mist p-4">
          <SearchX className="h-5 w-5 text-coral" />
          <div>
            <p className="font-black text-ink">{report.search.searchToPurchaseRatePlaceholder}% rate</p>
            <p className="mt-1 text-sm font-semibold text-slate">Tracks search, product click, cart, and order performance.</p>
          </div>
        </div>
      </AdminCard>
      <AdminCard title="Recommended product mapping">
        <AdminTable
          columns={["Search term", "Mapped product"]}
          rows={report.search.recommendedMappings.map((mapping) => [mapping.term, mapping.mappedProduct])}
        />
      </AdminCard>
    </div>
  );
}

function DatabaseNotesTab() {
  return (
    <AdminCard title="Indexes and query optimization notes">
      <div className="grid gap-3">
        {databaseOptimizationNotes.map((note) => (
          <p className="rounded-md bg-mist p-3 text-sm font-bold text-slate" key={note}>{note}</p>
        ))}
      </div>
    </AdminCard>
  );
}

function RankedTable({
  rows,
  title,
  valueFormat,
  valueKey = "revenue",
  valueLabel
}: {
  rows: Array<Record<string, number | string>>;
  title: string;
  valueFormat?: (value: number) => string;
  valueKey?: string;
  valueLabel: string;
}) {
  return (
    <AdminCard title={title}>
      {rows.length > 0 ? (
        <AdminTable
          columns={["Product", valueLabel, "Revenue"]}
          rows={rows.map((row) => [
            <span className="font-black text-ink" key="label">{String(row.label)}</span>,
            valueFormat ? valueFormat(Number(row[valueKey])) : Number(row[valueKey]).toLocaleString("en-IN"),
            formatRs(Number(row.revenue ?? 0))
          ])}
        />
      ) : (
        <EmptyState text="No matching products for this report." />
      )}
    </AdminCard>
  );
}

function ObjectTable({ rows, title }: { rows: Record<string, number>; title: string }) {
  const entries = Object.entries(rows);
  return (
    <AdminCard title={title}>
      {entries.length > 0 ? (
        <AdminTable columns={["Name", "Count"]} rows={entries.map(([label, count]) => [label, count])} />
      ) : (
        <EmptyState text="No rows for the selected date range." />
      )}
    </AdminCard>
  );
}

function BarChart({ rows }: { rows: Array<{ label: string; value: number }> }) {
  const max = Math.max(1, ...rows.map((row) => row.value));

  return (
    <div className="flex min-h-72 items-end gap-3 rounded-md bg-mist p-4">
      {rows.map((row) => (
        <div className="flex flex-1 flex-col items-center gap-2" key={row.label}>
          <div className="flex w-full items-end rounded-t-md bg-forest/15" style={{ height: 220 }}>
            <div className="w-full rounded-t-md bg-forest" style={{ height: `${Math.max(8, (row.value / max) * 220)}px` }} />
          </div>
          <span className="text-center text-xs font-bold text-slate">{row.label}</span>
          <span className="text-center text-xs font-black text-ink">{formatRs(row.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Metric({ label, tone, value }: { label: string; tone?: "forest" | "muted" | "sale"; value: string }) {
  return (
    <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className={`mt-2 text-2xl font-black ${tone === "forest" ? "text-forest" : tone === "sale" ? "text-coral" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-md border border-dashed border-black/20 bg-mist p-6 text-center text-sm font-bold text-slate">
      {text}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div className="h-20 animate-pulse rounded-md bg-mist" key={item} />
        ))}
      </div>
    </div>
  );
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-card border border-black/10 bg-white p-4 text-sm font-bold text-ink shadow-card">
      <BarChart3 className="h-5 w-5 text-forest" />
      <span>{message}</span>
      <button className="ml-auto text-slate" onClick={onDismiss} type="button">Dismiss</button>
    </div>
  );
}
