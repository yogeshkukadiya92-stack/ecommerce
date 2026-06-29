"use client";

import { FileCheck2, Search, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { adminOrders } from "@/mock/adminOrders";
import {
  batchRecallRecords,
  complianceRecords,
  delistRecords,
  productClaimReviews
} from "@/mock/compliance";
import type {
  BatchRecallRecord,
  ClaimStatus,
  ComplianceStatus,
  ProductClaimReview,
  ProductComplianceRecord,
  ProductDelistRecord
} from "@/types/compliance";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import {
  affectedOrdersForRecall,
  claimHasDiseaseLanguage,
  complianceCompleteness,
  scanClaimText,
  searchBatchesByNumber
} from "@/lib/compliance/complianceService";
import { canPerform } from "@/lib/security/securityService";
import { Badge } from "@/components/ui/Badge";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";

const tabs = ["Products", "Claims", "Delist", "Recall"] as const;
type ComplianceTab = (typeof tabs)[number];

export function ComplianceManagementClient() {
  const { session } = useAdminSession();
  const [activeTab, setActiveTab] = useState<ComplianceTab>("Products");
  const [records, setRecords] = useState<ProductComplianceRecord[]>(complianceRecords);
  const [claims, setClaims] = useState<ProductClaimReview[]>(productClaimReviews);
  const [delists, setDelists] = useState<ProductDelistRecord[]>(delistRecords);
  const [recalls, setRecalls] = useState<BatchRecallRecord[]>(batchRecallRecords);
  const [delistDraft, setDelistDraft] = useState({ productId: records[0]?.productId ?? "", reason: "" });
  const [recallDraft, setRecallDraft] = useState({ batchNumber: "WF-A1-1127", reason: "" });
  const [toast, setToast] = useState("");
  const canWriteCompliance = canPerform(session, "compliance:write");
  const canDelist = canPerform(session, "product:delist");
  const canRecall = canPerform(session, "recall:manage");
  const complianceCounts = useMemo(
    () => ({
      approved: records.filter((record) => record.status === "approved").length,
      needsUpdate: records.filter((record) => record.status === "needs_update").length,
      pending: records.filter((record) => record.status === "pending").length,
      rejected: records.filter((record) => record.status === "rejected").length
    }),
    [records]
  );
  const searchedBatches = searchBatchesByNumber(recallDraft.batchNumber);

  function updateComplianceStatus(recordId: string, status: ComplianceStatus) {
    const record = records.find((item) => item.id === recordId);
    setRecords((current) =>
      current.map((item) =>
        item.id === recordId
          ? {
              ...item,
              reviewedAt: new Date().toISOString(),
              reviewedBy: session?.fullName ?? "Admin",
              status
            }
          : item
      )
    );
    audit("admin.compliance.product.status", "ProductComplianceRecord", recordId, {
      oldValue: { status: record?.status },
      newValue: { status }
    });
    setToast(`Compliance status marked ${status}.`);
  }

  function updateClaimStatus(claimId: string, status: ClaimStatus) {
    const claim = claims.find((item) => item.id === claimId);
    const warningTerms = claim ? scanClaimText(claim.claimText) : [];
    setClaims((current) =>
      current.map((item) =>
        item.id === claimId
          ? {
              ...item,
              reviewerNote:
                warningTerms.length > 0 && status === "approved"
                  ? "Approval blocked placeholder: disease claim terms detected."
                  : item.reviewerNote,
              status: warningTerms.length > 0 && status === "approved" ? "rejected" : status,
              warningTerms: [...new Set([...item.warningTerms, ...warningTerms])]
            }
          : item
      )
    );
    audit("admin.compliance.claim.review", "ProductClaimReview", claimId, {
      oldValue: { status: claim?.status },
      newValue: { status: warningTerms.length > 0 && status === "approved" ? "rejected" : status },
      warningTerms
    });
    setToast(warningTerms.length > 0 && status === "approved" ? "Disease-claim language detected. Claim rejected." : `Claim marked ${status}.`);
  }

  function delistProduct() {
    const product = records.find((record) => record.productId === delistDraft.productId);

    if (!product) {
      setToast("Select a product to delist.");
      return;
    }

    if (delistDraft.reason.trim().length < 8) {
      setToast("Delist reason is required and should be specific.");
      return;
    }

    const record: ProductDelistRecord = {
      delistedAt: new Date().toISOString(),
      delistedBy: session?.fullName ?? "Admin",
      id: `delist-${Date.now()}`,
      productId: product.productId,
      productName: product.productName,
      reason: delistDraft.reason.trim()
    };
    setDelists((current) => [record, ...current]);
    audit("admin.compliance.product.delist", "Product", product.productId, {
      newValue: { reason: record.reason, status: "delisted" }
    });
    setToast(`${product.productName} delisted in mock state.`);
  }

  function createRecall(batchId: string, batchNumber: string, productId: string, productName: string, sku: string) {
    if (recallDraft.reason.trim().length < 8) {
      setToast("Recall reason is required.");
      return;
    }

    const affectedOrderIds = adminOrders
      .filter((order) => order.items.some((item) => item.batchId === batchId || item.batchNumber === batchNumber))
      .map((order) => order.id);
    const recall: BatchRecallRecord = {
      affectedOrderIds,
      batchId,
      batchNumber,
      blockedFromSale: true,
      createdAt: new Date().toISOString(),
      customerNotificationStatus: "queued",
      id: `recall-${Date.now()}`,
      productId,
      productName,
      reason: recallDraft.reason.trim(),
      sku,
      status: "open"
    };
    setRecalls((current) => [recall, ...current]);
    audit("admin.compliance.batch.recall", "Batch", batchId, {
      newValue: {
        affectedOrderIds,
        blockedFromSale: true,
        notification: "queued"
      }
    });
    setToast(`Batch ${batchNumber} recalled, blocked from sale, and notifications queued.`);
  }

  function markRecallNotified(recallId: string) {
    setRecalls((current) =>
      current.map((recall) =>
        recall.id === recallId ? { ...recall, customerNotificationStatus: "sent", status: "notified" } : recall
      )
    );
    audit("admin.compliance.recall.notify", "BatchRecall", recallId, {
      newValue: { customerNotificationStatus: "sent", status: "notified" }
    });
    setToast("Customer notification placeholder marked sent.");
  }

  function audit(action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
    writeAdminAuditLog(session, {
      action,
      entityId,
      entityType,
      metadata,
      module: "compliance",
      newValue: metadata?.newValue,
      oldValue: metadata?.oldValue
    });
  }

  return (
    <div className="grid gap-6">
      {toast ? <Toast message={toast} onDismiss={() => setToast("")} /> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Pending" value={String(complianceCounts.pending)} />
        <Metric label="Approved" value={String(complianceCounts.approved)} />
        <Metric label="Needs update" value={String(complianceCounts.needsUpdate)} tone="sale" />
        <Metric label="Open recalls" value={String(recalls.filter((recall) => recall.status !== "closed").length)} tone="sale" />
      </div>

      <AdminCard>
        <div className="flex gap-2 overflow-x-auto">
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
      </AdminCard>

      {activeTab === "Products" ? (
        <ProductsTab
          canWrite={canWriteCompliance}
          records={records}
          updateComplianceStatus={updateComplianceStatus}
        />
      ) : null}
      {activeTab === "Claims" ? <ClaimsTab claims={claims} canWrite={canWriteCompliance} updateClaimStatus={updateClaimStatus} /> : null}
      {activeTab === "Delist" ? (
        <DelistTab
          canDelist={canDelist}
          delistDraft={delistDraft}
          delistProduct={delistProduct}
          delists={delists}
          records={records}
          setDelistDraft={setDelistDraft}
        />
      ) : null}
      {activeTab === "Recall" ? (
        <RecallTab
          canRecall={canRecall}
          createRecall={createRecall}
          markRecallNotified={markRecallNotified}
          recallDraft={recallDraft}
          recalls={recalls}
          searchedBatches={searchedBatches}
          setRecallDraft={setRecallDraft}
        />
      ) : null}
    </div>
  );
}

function ProductsTab({
  canWrite,
  records,
  updateComplianceStatus
}: {
  canWrite: boolean;
  records: ProductComplianceRecord[];
  updateComplianceStatus: (recordId: string, status: ComplianceStatus) => void;
}) {
  return (
    <AdminCard title="Product compliance checks">
      <AdminTable
        columns={["Product", "Required declarations", "Assets", "Batch/expiry", "Status", "Actions"]}
        rows={records.map((record) => {
          const completeness = complianceCompleteness(record);
          return [
            <div key="product" className="max-w-sm">
              <p className="font-black text-ink">{record.productName}</p>
              <p className="mt-1 text-xs font-bold text-slate">FSSAI/license: {record.fssaiLicense || "Pending"}</p>
              <p className="mt-1 text-xs font-bold text-slate">Manufacturer: {record.manufacturerName || "Pending"}</p>
              <p className="mt-1 text-xs font-bold text-slate">Marketer/importer: {record.marketerOrImporterName || "Pending"}</p>
            </div>,
            <div className="grid gap-1 text-xs font-bold text-slate" key="declarations">
              <span>Ingredients: {record.ingredientDeclaration ? "Yes" : "Missing"}</span>
              <span>Allergens: {record.allergenDeclaration ? "Yes" : "Missing"}</span>
              <span>Warning: {record.warningText ? "Yes" : "Missing"}</span>
              <span>{record.notForMedicinalUseText || "Not for medicinal use text missing"}</span>
            </div>,
            <div className="grid gap-1 text-xs font-bold text-slate" key="assets">
              <span>Label image: {record.labelImageUrl ? "Ready" : "Required"}</span>
              <span>Nutrition label: {record.nutritionLabelImageUrl ? "Ready" : "Required"}</span>
              <span>COA/lab report: {record.labReportUrl ? "Ready" : "Upload placeholder"}</span>
              <span>Completeness: {completeness.percent}%</span>
            </div>,
            record.batchExpiryVisible ? "Visible" : "Missing",
            <Badge key="status" tone={record.status === "approved" ? "success" : record.status === "rejected" ? "sale" : "neutral"}>{record.status}</Badge>,
            <div className="flex flex-wrap gap-2" key="actions">
              {(["pending", "approved", "rejected", "needs_update"] as ComplianceStatus[]).map((status) => (
                <button className="admin-action" disabled={!canWrite} key={status} onClick={() => updateComplianceStatus(record.id, status)} type="button">{status}</button>
              ))}
            </div>
          ];
        })}
      />
    </AdminCard>
  );
}

function ClaimsTab({
  canWrite,
  claims,
  updateClaimStatus
}: {
  canWrite: boolean;
  claims: ProductClaimReview[];
  updateClaimStatus: (claimId: string, status: ClaimStatus) => void;
}) {
  return (
    <AdminCard title="Claim approval workflow">
      <AdminTable
        columns={["Product", "Claim", "Warning", "Status", "Actions"]}
        rows={claims.map((claim) => {
          const warningTerms = [...new Set([...claim.warningTerms, ...scanClaimText(claim.claimText)])];
          return [
            claim.productName,
            <p className="max-w-md text-sm leading-6" key="claim">{claim.claimText}</p>,
            warningTerms.length > 0 ? (
              <div className="grid gap-2" key="warning">
                <Badge tone="sale">Disease-claim warning</Badge>
                <p className="text-xs font-bold text-coral">{warningTerms.join(", ")}</p>
              </div>
            ) : (
              <Badge key="warning" tone="success">Clean</Badge>
            ),
            <Badge key="status" tone={claim.status === "approved" ? "success" : claim.status === "rejected" ? "sale" : "neutral"}>{claim.status}</Badge>,
            <div className="flex flex-wrap gap-2" key="actions">
              <button className="admin-action" disabled={!canWrite || claimHasDiseaseLanguage(claim)} onClick={() => updateClaimStatus(claim.id, "approved")} type="button">Approve</button>
              <button className="admin-action" disabled={!canWrite} onClick={() => updateClaimStatus(claim.id, "rejected")} type="button">Reject</button>
              <button className="admin-action" disabled={!canWrite} onClick={() => updateClaimStatus(claim.id, "pending")} type="button">Needs review</button>
            </div>
          ];
        })}
      />
      <p className="mt-4 rounded-md bg-mist p-3 text-sm font-semibold text-slate">
        Disease cure claim placeholder scans for words like cure, treat, diagnose, and prevent disease before approval.
      </p>
    </AdminCard>
  );
}

function DelistTab({
  canDelist,
  delistDraft,
  delistProduct,
  delists,
  records,
  setDelistDraft
}: {
  canDelist: boolean;
  delistDraft: { productId: string; reason: string };
  delistProduct: () => void;
  delists: ProductDelistRecord[];
  records: ProductComplianceRecord[];
  setDelistDraft: (draft: { productId: string; reason: string }) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      <AdminCard title="Delist non-compliant product">
        <div className="grid gap-3">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Product</span>
            <select className="focus-ring h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm" onChange={(event) => setDelistDraft({ ...delistDraft, productId: event.target.value })} value={delistDraft.productId}>
              {records.map((record) => <option key={record.id} value={record.productId}>{record.productName}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Reason required</span>
            <textarea className="focus-ring min-h-28 w-full rounded-md border border-black/10 p-3 text-sm" onChange={(event) => setDelistDraft({ ...delistDraft, reason: event.target.value })} value={delistDraft.reason} />
          </label>
          <button className="focus-ring rounded-md bg-coral px-4 py-3 text-sm font-black text-white disabled:opacity-50" disabled={!canDelist} onClick={delistProduct} type="button">
            Delist product
          </button>
        </div>
      </AdminCard>
      <AdminCard title="Delist log">
        <AdminTable
          columns={["Product", "Reason", "By", "At"]}
          rows={delists.map((record) => [record.productName, record.reason, record.delistedBy, new Date(record.delistedAt).toLocaleString("en-IN")])}
        />
      </AdminCard>
    </div>
  );
}

function RecallTab({
  canRecall,
  createRecall,
  markRecallNotified,
  recallDraft,
  recalls,
  searchedBatches,
  setRecallDraft
}: {
  canRecall: boolean;
  createRecall: (batchId: string, batchNumber: string, productId: string, productName: string, sku: string) => void;
  markRecallNotified: (recallId: string) => void;
  recallDraft: { batchNumber: string; reason: string };
  recalls: BatchRecallRecord[];
  searchedBatches: ReturnType<typeof searchBatchesByNumber>;
  setRecallDraft: (draft: { batchNumber: string; reason: string }) => void;
}) {
  return (
    <div className="grid gap-6">
      <AdminCard title="Recall workflow">
        <div className="grid gap-3 lg:grid-cols-[1fr_1fr]">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Search by batch number</span>
            <div className="flex h-11 items-center gap-2 rounded-md border border-black/10 bg-white px-3">
              <Search className="h-4 w-4 text-slate" />
              <input className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" onChange={(event) => setRecallDraft({ ...recallDraft, batchNumber: event.target.value })} value={recallDraft.batchNumber} />
            </div>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Recall reason required</span>
            <input className="focus-ring h-11 w-full rounded-md border border-black/10 px-3 text-sm" onChange={(event) => setRecallDraft({ ...recallDraft, reason: event.target.value })} value={recallDraft.reason} />
          </label>
        </div>
        <div className="mt-4 grid gap-3">
          {searchedBatches.slice(0, 4).map((batch) => (
            <div className="rounded-md border border-black/10 p-4" key={batch.id}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-black text-ink">{batch.batchNumber} - {batch.productName}</p>
                  <p className="mt-1 text-sm font-semibold text-slate">{batch.sku} / expiry {batch.expiryDate}</p>
                </div>
                <button className="admin-action" disabled={!canRecall} onClick={() => createRecall(batch.id, batch.batchNumber, batch.productId, batch.productName, batch.sku)} type="button">
                  Mark batch recalled
                </button>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
      <AdminCard title="Recall records and affected orders">
        <AdminTable
          columns={["Batch", "Product", "Status", "Blocked", "Affected orders", "Notification", "Actions"]}
          rows={recalls.map((recall) => [
            recall.batchNumber,
            recall.productName,
            <Badge key="status" tone={recall.status === "closed" ? "success" : "sale"}>{recall.status}</Badge>,
            recall.blockedFromSale ? "Blocked from sale" : "Sellable",
            affectedOrdersForRecall(recall).map((order) => order.orderNumber).join(", ") || "-",
            recall.customerNotificationStatus,
            <button className="admin-action" disabled={!canRecall} key="notify" onClick={() => markRecallNotified(recall.id)} type="button">Notify customers</button>
          ])}
        />
      </AdminCard>
    </div>
  );
}

function Metric({ label, tone, value }: { label: string; tone?: "sale"; value: string }) {
  return (
    <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className={`mt-2 text-3xl font-black ${tone === "sale" ? "text-coral" : "text-ink"}`}>{value}</p>
    </div>
  );
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-card border border-black/10 bg-white p-4 text-sm font-bold text-ink shadow-card">
      {message.toLowerCase().includes("recall") ? <ShieldAlert className="h-5 w-5 text-coral" /> : <FileCheck2 className="h-5 w-5 text-forest" />}
      <span>{message}</span>
      <button className="ml-auto text-slate" onClick={onDismiss} type="button">Dismiss</button>
    </div>
  );
}
