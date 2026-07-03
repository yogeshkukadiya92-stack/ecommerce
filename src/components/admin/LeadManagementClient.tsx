"use client";

import { Download, Loader2, Plus, Search, UsersRound } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { StatCard } from "@/components/ui/StatCard";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";

type WhatsAppLead = {
  groupName: string;
  id: string;
  isGroupAdmin: boolean;
  name: string;
  note: string | null;
  phone: string;
  specialAttention: string | null;
};

type LeadResponse = {
  data?: WhatsAppLead[];
  message?: string;
  meta?: {
    admins: number;
    groups: number;
    total: number;
  };
};

export function LeadManagementClient() {
  const [leads, setLeads] = useState<WhatsAppLead[]>([]);
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [draft, setDraft] = useState({
    groupName: "1) Arogya - Health",
    isGroupAdmin: false,
    name: "",
    note: "",
    phone: "",
    specialAttention: ""
  });

  useEffect(() => {
    void loadLeads();
  }, []);

  const groups = useMemo(() => [...new Set(leads.map((lead) => lead.groupName))].sort(), [leads]);
  const filteredLeads = useMemo(
    () =>
      leads.filter((lead) => {
        const matchesGroup = group === "all" || lead.groupName === group;
        const matchesQuery = [lead.name, lead.phone, lead.groupName, lead.note ?? "", lead.specialAttention ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(query.toLowerCase());
        return matchesGroup && matchesQuery;
      }),
    [group, leads, query]
  );

  async function loadLeads() {
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/leads", { cache: "no-store" });
      const result = (await response.json().catch(() => ({}))) as LeadResponse;

      if (!response.ok) {
        setError(result.message ?? "Unable to load leads.");
        return;
      }

      setLeads(result.data ?? []);
    } catch {
      setError("Unable to load leads. Check DATABASE_URL and redeploy.");
    } finally {
      setIsLoading(false);
    }
  }

  async function saveLead() {
    setIsSaving(true);
    setError("");
    setToast("");

    try {
      const response = await fetch("/api/admin/leads", {
        body: JSON.stringify(draft),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json().catch(() => ({}))) as LeadResponse;

      if (!response.ok) {
        setError(result.message ?? "Unable to save lead.");
        return;
      }

      setToast("Lead saved.");
      setDraft((current) => ({ ...current, isGroupAdmin: false, name: "", note: "", phone: "", specialAttention: "" }));
      await loadLeads();
    } catch {
      setError("Unable to save lead. Check MongoDB connection.");
    } finally {
      setIsSaving(false);
    }
  }

  function exportCsv() {
    const header = ["Name", "Phone", "Group", "Admin", "Note", "Special Attention"];
    const rows = filteredLeads.map((lead) => [
      lead.name,
      lead.phone,
      lead.groupName,
      lead.isGroupAdmin ? "Yes" : "No",
      lead.note ?? "",
      lead.specialAttention ?? ""
    ]);
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "whatsapp-leads.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="grid gap-6">
      {toast ? <div className="rounded-md bg-mint px-4 py-3 text-sm font-black text-forest">{toast}</div> : null}
      {error ? <div className="rounded-md bg-coral/10 px-4 py-3 text-sm font-black text-coral">{error}</div> : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total leads" value={leads.length} tone="forest" />
        <StatCard label="Groups" value={groups.length} />
        <StatCard label="Group admins" value={leads.filter((lead) => lead.isGroupAdmin).length} />
        <StatCard label="Visible now" value={filteredLeads.length} />
      </div>

      <AdminCard title="Add lead" description="Save WhatsApp group contacts directly to MongoDB. Phone numbers are normalized to India country code when needed.">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_1fr_1fr_auto] lg:items-end">
          <Input label="Name" onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} value={draft.name} />
          <Input label="Phone" onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} value={draft.phone} />
          <Input label="Group" onChange={(event) => setDraft((current) => ({ ...current, groupName: event.target.value }))} value={draft.groupName} />
          <Input label="Note" onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))} value={draft.note} />
          <button className="admin-action h-11 justify-center bg-ink text-white" disabled={isSaving} onClick={saveLead} type="button">
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Save
          </button>
        </div>
        <label className="mt-3 flex items-center gap-2 text-sm font-bold text-ink">
          <input
            checked={draft.isGroupAdmin}
            onChange={(event) => setDraft((current) => ({ ...current, isGroupAdmin: event.target.checked }))}
            type="checkbox"
          />
          Group admin / leader
        </label>
      </AdminCard>

      <AdminCard
        action={
          <button className="admin-action" disabled={filteredLeads.length === 0} onClick={exportCsv} type="button">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        }
        title="Lead list"
        description="Search by name, phone, group, note, or special attention."
      >
        <div className="mb-4 grid gap-3 md:grid-cols-[1fr_260px]">
          <label className="flex h-11 items-center gap-2 rounded-md border border-black/10 bg-white px-3">
            <Search className="h-4 w-4 text-slate" />
            <input className="min-w-0 flex-1 text-sm font-semibold outline-none" onChange={(event) => setQuery(event.target.value)} placeholder="Search leads" value={query} />
          </label>
          <select className="focus-ring h-11 rounded-md border border-black/10 bg-white px-3 text-sm font-bold text-ink" onChange={(event) => setGroup(event.target.value)} value={group}>
            <option value="all">All groups</option>
            {groups.map((groupName) => <option key={groupName} value={groupName}>{groupName}</option>)}
          </select>
        </div>

        {isLoading ? (
          <div className="grid min-h-48 place-items-center rounded-card border border-black/10 bg-mist text-sm font-black text-slate">
            <Loader2 className="mb-2 h-5 w-5 animate-spin" />
            Loading leads
          </div>
        ) : (
          <AdminTable
            columns={["Name", "Phone", "Group", "Role", "Notes"]}
            emptyText="No leads saved yet. Add your first WhatsApp contact above."
            rows={filteredLeads.map((lead) => [
              <span className="font-black text-ink" key="name">{lead.name}</span>,
              <a className="font-black text-forest" href={`https://wa.me/${lead.phone}`} key="phone" rel="noreferrer" target="_blank">{lead.phone}</a>,
              lead.groupName,
              lead.isGroupAdmin ? <Badge key="admin" tone="success">Admin</Badge> : <Badge key="member">Member</Badge>,
              <div className="max-w-md text-sm" key="notes">
                <p>{lead.note ?? "-"}</p>
                {lead.specialAttention ? <p className="mt-1 font-bold text-coral">{lead.specialAttention}</p> : null}
              </div>
            ])}
          />
        )}
      </AdminCard>

      <AdminCard>
        <div className="flex items-start gap-3">
          <UsersRound className="h-5 w-5 text-forest" />
          <div>
            <h2 className="font-black text-ink">Excel import next step</h2>
            <p className="mt-1 text-sm leading-6 text-slate">
              The uploaded workbook is structured well for bulk import. I can add a bulk Excel import button next so the full WhatsApp list uploads into this module in one action.
            </p>
          </div>
        </div>
      </AdminCard>
    </div>
  );
}
