"use client";

import { Download, FileText, MessageSquarePlus, Users } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { customers } from "@/mock/customers";
import { orders } from "@/mock/orders";
import { productReviews } from "@/mock/engagement";
import { storefrontProducts } from "@/mock/storefront";
import { formatRs } from "@/lib/cart/cartPricing";
import { getCrmRows, getCustomerProfile, getCustomerSegments } from "@/lib/engagement/engagementService";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import { Badge } from "@/components/ui/Badge";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";

export function CustomerCrmClient() {
  const { session } = useAdminSession();
  const crmRows = getCrmRows();
  const [selectedCustomerId, setSelectedCustomerId] = useState(crmRows[0]?.customer.id ?? "");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [noteDraft, setNoteDraft] = useState("");
  const [toast, setToast] = useState("");
  const selectedCustomer = customers.find((customer) => customer.id === selectedCustomerId) ?? customers[0];
  const selectedProfile = getCustomerProfile(selectedCustomer.id);
  const selectedSegments = selectedProfile ? getCustomerSegments(selectedProfile) : ["new"];
  const filteredRows = useMemo(
    () =>
      crmRows.filter((row) =>
        segmentFilter === "all" ? true : row.segments.some((segment) => segment === segmentFilter)
      ),
    [crmRows, segmentFilter]
  );
  const customerOrders = orders.filter((order) => order.customerId === selectedCustomer.id);
  const customerReviews = productReviews.filter((review) => review.customerId === selectedCustomer.id);
  const wishlistProducts = storefrontProducts.filter((product) =>
    selectedProfile?.wishlistProductIds.includes(product.id)
  );

  function saveNote() {
    if (!noteDraft.trim()) {
      setToast("Add a note before saving.");
      return;
    }

    writeAdminAuditLog(session, {
      action: "admin.crm.note.add",
      entityId: selectedCustomer.id,
      entityType: "Customer",
      metadata: { note: noteDraft }
    });
    setNoteDraft("");
    setToast("Support note saved to audit log placeholder.");
  }

  function exportCustomers() {
    writeAdminAuditLog(session, {
      action: "admin.crm.export",
      entityType: "Customer",
      metadata: { count: filteredRows.length, segmentFilter }
    });
    setToast("Customer export placeholder queued.");
  }

  return (
    <div className="grid gap-6">
      {toast ? <Toast message={toast} onDismiss={() => setToast("")} /> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Customers" value={String(customers.length)} />
        <Metric label="VIP segment" value={String(crmRows.filter((row) => row.segments.includes("VIP")).length)} />
        <Metric label="Repeat buyers" value={String(crmRows.filter((row) => row.segments.includes("repeat")).length)} />
        <Metric label="COD risk" value={String(crmRows.filter((row) => row.segments.includes("COD risk")).length)} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <AdminCard title="Customer list">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <select
              className="focus-ring h-11 rounded-md border border-black/10 bg-white px-3 text-sm font-bold text-ink"
              onChange={(event) => setSegmentFilter(event.target.value)}
              value={segmentFilter}
            >
              <option value="all">All segments</option>
              {["new", "repeat", "VIP", "inactive", "COD risk", "high return rate"].map((segment) => (
                <option key={segment} value={segment}>{segment}</option>
              ))}
            </select>
            <button className="admin-action justify-center" onClick={exportCustomers} type="button">
              <Download className="h-4 w-4" /> Export customer list
            </button>
          </div>
          <AdminTable
            columns={["Customer", "Segments", "Lifetime value", "AOV", "Last order", "Actions"]}
            rows={filteredRows.map(({ customer, profile, segments }) => [
              <div key="customer">
                <p className="font-black text-ink">{customer.firstName} {customer.lastName}</p>
                <p className="mt-1 text-xs font-semibold text-slate">{customer.email}</p>
              </div>,
              <div className="flex flex-wrap gap-2" key="segments">{segments.map((segment) => <Badge key={segment} tone={segment === "VIP" ? "success" : segment === "COD risk" ? "sale" : "neutral"}>{segment}</Badge>)}</div>,
              formatRs(profile?.lifetimeValue ?? 0),
              formatRs(profile?.averageOrderValue ?? 0),
              profile?.lastOrderDate ?? "-",
              <button className="admin-action" key="view" onClick={() => setSelectedCustomerId(customer.id)} type="button">View profile</button>
            ])}
          />
        </AdminCard>

        <AdminCard title="Customer profile">
          <div className="flex items-start gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-ink text-lg font-black text-white">
              {selectedCustomer.firstName[0]}{selectedCustomer.lastName[0]}
            </div>
            <div>
              <h2 className="text-xl font-black text-ink">{selectedCustomer.firstName} {selectedCustomer.lastName}</h2>
              <p className="mt-1 text-sm font-semibold text-slate">{selectedCustomer.email}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedSegments.map((segment) => <Badge key={segment}>{segment}</Badge>)}
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric compact label="Lifetime value" value={formatRs(selectedProfile?.lifetimeValue ?? 0)} />
            <Metric compact label="Avg order value" value={formatRs(selectedProfile?.averageOrderValue ?? 0)} />
            <Metric compact label="Repeat purchases" value={String(selectedProfile?.repeatPurchaseCount ?? 0)} />
            <Metric compact label="Return rate" value={`${selectedProfile?.returnRatePercent ?? 0}%`} />
          </div>

          <ProfileBlock title="Order history" icon={<FileText className="h-4 w-4" />}>
            {customerOrders.length > 0 ? customerOrders.map((order) => (
              <div className="rounded-md bg-mist p-3 text-sm" key={order.id}>
                <p className="font-black text-ink">{order.orderNumber}</p>
                <p className="mt-1 font-semibold text-slate">{order.status} - {formatRs(order.totalAmount)}</p>
              </div>
            )) : <EmptyLine text="No mock orders for this customer yet." />}
          </ProfileBlock>

          <ProfileBlock title="Wishlist" icon={<Users className="h-4 w-4" />}>
            {wishlistProducts.length > 0 ? wishlistProducts.map((product) => (
              <p className="rounded-md bg-mist p-3 text-sm font-bold text-ink" key={product.id}>{product.name}</p>
            )) : <EmptyLine text="Wishlist placeholder is empty." />}
          </ProfileBlock>

          <ProfileBlock title="Reviews" icon={<FileText className="h-4 w-4" />}>
            {customerReviews.map((review) => (
              <div className="rounded-md bg-mist p-3 text-sm" key={review.id}>
                <p className="font-black text-ink">{review.productName}</p>
                <p className="mt-1 text-slate">{review.rating}/5 - {review.status}</p>
              </div>
            ))}
          </ProfileBlock>

          <ProfileBlock title="Support notes" icon={<MessageSquarePlus className="h-4 w-4" />}>
            {selectedProfile?.supportNotes.map((note) => (
              <p className="rounded-md bg-mist p-3 text-sm font-semibold text-slate" key={note.id}>{note.note}</p>
            ))}
            <textarea
              className="focus-ring min-h-24 w-full rounded-md border border-black/10 p-3 text-sm"
              onChange={(event) => setNoteDraft(event.target.value)}
              placeholder="Add internal customer note"
              value={noteDraft}
            />
            <button className="admin-action justify-center" onClick={saveNote} type="button">Save admin note</button>
          </ProfileBlock>
        </AdminCard>
      </div>
    </div>
  );
}

function ProfileBlock({ children, icon, title }: { children: ReactNode; icon: ReactNode; title: string }) {
  return (
    <div className="mt-5 grid gap-3">
      <h3 className="flex items-center gap-2 text-sm font-black text-ink">{icon}{title}</h3>
      {children}
    </div>
  );
}

function Metric({ compact, label, value }: { compact?: boolean; label: string; value: string }) {
  return (
    <div className={`rounded-card border border-black/10 bg-white ${compact ? "p-3" : "p-5"} shadow-sm`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className={`${compact ? "text-lg" : "text-3xl"} mt-2 font-black text-ink`}>{value}</p>
    </div>
  );
}

function EmptyLine({ text }: { text: string }) {
  return <p className="rounded-md bg-mist p-3 text-sm font-semibold text-slate">{text}</p>;
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-card border border-black/10 bg-white p-4 text-sm font-bold text-ink shadow-card">
      <Users className="h-5 w-5 text-forest" />
      <span>{message}</span>
      <button className="ml-auto text-slate" onClick={onDismiss} type="button">Dismiss</button>
    </div>
  );
}
