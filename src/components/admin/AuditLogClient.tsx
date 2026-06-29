"use client";

import { ClipboardList, Filter } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { seededAuditLogs } from "@/mock/security";
import type { AdminAuditLogEntry } from "@/types/admin";
import { readAdminAuditLogs } from "@/lib/admin/auditLog";
import { Badge } from "@/components/ui/Badge";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";

export function AuditLogClient() {
  const [storedLogs, setStoredLogs] = useState<AdminAuditLogEntry[]>([]);
  const [filters, setFilters] = useState({ admin: "all", date: "", module: "all" });

  useEffect(() => {
    function loadLogs() {
      setStoredLogs(readAdminAuditLogs());
    }

    loadLogs();
    window.addEventListener("fitsupplement:admin-audit", loadLogs);
    window.addEventListener("storage", loadLogs);

    return () => {
      window.removeEventListener("fitsupplement:admin-audit", loadLogs);
      window.removeEventListener("storage", loadLogs);
    };
  }, []);

  const allLogs = useMemo(() => [...storedLogs, ...seededAuditLogs], [storedLogs]);
  const modules = useMemo(() => [...new Set(allLogs.map((log) => log.module))].sort(), [allLogs]);
  const admins = useMemo(() => [...new Set(allLogs.map((log) => log.actorEmail))].sort(), [allLogs]);
  const filteredLogs = useMemo(
    () =>
      allLogs.filter((log) => {
        const moduleMatch = filters.module === "all" || log.module === filters.module;
        const adminMatch = filters.admin === "all" || log.actorEmail === filters.admin;
        const dateMatch = !filters.date || log.at.startsWith(filters.date);
        return moduleMatch && adminMatch && dateMatch;
      }),
    [allLogs, filters]
  );

  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Visible logs" value={String(filteredLogs.length)} />
        <Metric label="Stored logs" value={String(storedLogs.length)} />
        <Metric label="Modules" value={String(modules.length)} />
        <Metric label="Admins" value={String(admins.length)} />
      </div>

      <AdminCard title="Audit filters">
        <div className="grid gap-3 md:grid-cols-4">
          <SelectField label="Module" onChange={(value) => setFilters((current) => ({ ...current, module: value }))} value={filters.module}>
            <option value="all">All modules</option>
            {modules.map((module) => <option key={module} value={module}>{module}</option>)}
          </SelectField>
          <SelectField label="Admin" onChange={(value) => setFilters((current) => ({ ...current, admin: value }))} value={filters.admin}>
            <option value="all">All admins</option>
            {admins.map((admin) => <option key={admin} value={admin}>{admin}</option>)}
          </SelectField>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-ink">Date</span>
            <input className="focus-ring h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm text-ink" onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} type="date" value={filters.date} />
          </label>
          <button className="admin-action mt-7 h-11 justify-center" onClick={() => setFilters({ admin: "all", date: "", module: "all" })} type="button">
            <Filter className="h-4 w-4" /> Reset filters
          </button>
        </div>
      </AdminCard>

      <AdminCard title="Admin activity logs">
        <AdminTable
          columns={["Timestamp", "Admin", "Action", "Module", "Old value", "New value", "IP / device"]}
          rows={filteredLogs.map((log) => [
            new Date(log.at).toLocaleString("en-IN"),
            <div key="admin">
              <p className="font-black text-ink">{log.actorName ?? log.actorEmail}</p>
              <p className="mt-1 text-xs font-semibold text-slate">{log.actorEmail}</p>
            </div>,
            <div key="action">
              <p className="font-black text-ink">{log.action}</p>
              <p className="mt-1 text-xs font-semibold text-slate">{log.entityType}{log.entityId ? ` / ${log.entityId}` : ""}</p>
            </div>,
            <Badge key="module" tone={log.module === "security" || log.module === "compliance" ? "sale" : "neutral"}>{log.module}</Badge>,
            <CodeValue key="old" value={log.oldValue} />,
            <CodeValue key="new" value={log.newValue ?? log.metadata} />,
            <div className="text-xs font-semibold text-slate" key="device">
              <p>{log.ipAddress ?? "IP placeholder"}</p>
              <p className="mt-1">{log.userAgent ?? "Device placeholder"}</p>
            </div>
          ])}
        />
      </AdminCard>
    </div>
  );
}

function SelectField({
  children,
  label,
  onChange,
  value
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <select className="focus-ring h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm text-ink" onChange={(event) => onChange(event.target.value)} value={value}>
        {children}
      </select>
    </label>
  );
}

function CodeValue({ value }: { value: unknown }) {
  if (value == null) {
    return <span className="text-xs font-semibold text-slate">-</span>;
  }

  return (
    <code className="block max-w-xs whitespace-pre-wrap rounded-md bg-mist p-2 text-xs text-slate">
      {JSON.stringify(value, null, 2)}
    </code>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <ClipboardList className="h-5 w-5 text-forest" />
      <p className="mt-3 text-xs font-black uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}
