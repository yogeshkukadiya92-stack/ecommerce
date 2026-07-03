"use client";

import { KeyRound, LockKeyhole, ShieldCheck, TimerReset, Upload } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { securityChecklist } from "@/mock/security";
import { adminRoles, sensitivePermissionMap } from "@/lib/admin/adminAuth";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { showDemoData } from "@/lib/admin/liveData";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import { maskEmail, maskPhone, rolePermissionRows, validateSecureUpload } from "@/lib/security/securityService";
import { customers } from "@/mock/customers";
import type { AdminPermission } from "@/types/admin";
import { Badge } from "@/components/ui/Badge";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";

export function SecurityManagementClient() {
  const { session } = useAdminSession();
  const [uploadName, setUploadName] = useState("coa-report.pdf");
  const [toast, setToast] = useState("");
  const permissionRows = useMemo(() => rolePermissionRows(adminRoles), []);
  const uploadResult = validateSecureUpload(uploadName);

  function runSecurityAction(action: string) {
    writeAdminAuditLog(session, {
      action: `admin.security.${action}`,
      entityType: "SecurityControl",
      metadata: { recordedFromAdmin: true },
      module: "security"
    });
    setToast(`${action.replaceAll("_", " ")} control recorded.`);
  }

  return (
    <div className="grid gap-6">
      {toast ? <Toast message={toast} onDismiss={() => setToast("")} /> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Roles" value={String(adminRoles.length)} />
        <Metric label="Sensitive permissions" value={String(Object.keys(sensitivePermissionMap).length)} />
        <Metric label="2FA status" value="Ready" />
        <Metric label="Rate limit" value="Configured" />
      </div>

      <AdminCard title="Role-based access control">
        <AdminTable
          columns={["Role", "Description", "Sensitive permissions", "Permission count"]}
          rows={permissionRows.map(({ role }) => [
            <span className="font-black text-ink" key="role">{role.name}</span>,
            role.description,
            <div className="flex max-w-lg flex-wrap gap-2" key="permissions">
              {Object.entries(sensitivePermissionMap).map(([permission, label]) => (
                <Badge key={permission} tone={role.permissions.includes(permission as AdminPermission) ? "success" : "neutral"}>
                  {role.permissions.includes(permission as AdminPermission) ? label : `${label}: no`}
                </Badge>
              ))}
            </div>,
            role.permissions.length
          ])}
        />
      </AdminCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminCard title="Admin security controls">
          <div className="grid gap-3 sm:grid-cols-2">
            <SecurityAction icon={<LockKeyhole className="h-5 w-5" />} label="Two-factor authentication" onClick={() => runSecurityAction("2fa")} />
            <SecurityAction icon={<KeyRound className="h-5 w-5" />} label="Password reset" onClick={() => runSecurityAction("password_reset")} />
            <SecurityAction icon={<TimerReset className="h-5 w-5" />} label="Session timeout" onClick={() => runSecurityAction("session_timeout")} />
            <SecurityAction icon={<ShieldCheck className="h-5 w-5" />} label="Rate limiting" onClick={() => runSecurityAction("rate_limiting")} />
          </div>
          <div className="mt-5 grid gap-2">
            {securityChecklist.map((item) => (
              <p className="rounded-md bg-mist p-3 text-sm font-bold text-slate" key={item}>{item}</p>
            ))}
          </div>
        </AdminCard>

        <AdminCard title="Validation and masking">
          <div className="grid gap-4">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-ink">Secure file upload validation</span>
              <div className="flex h-11 items-center gap-2 rounded-md border border-black/10 bg-white px-3">
                <Upload className="h-4 w-4 text-slate" />
                <input className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none" onChange={(event) => setUploadName(event.target.value)} value={uploadName} />
              </div>
            </label>
            <Badge tone={uploadResult.ok ? "success" : "sale"}>{uploadResult.message}</Badge>
            <div className="rounded-md bg-mist p-4 text-sm font-semibold text-slate">
              <p className="font-black text-ink">Sensitive data masking examples</p>
              {(showDemoData ? customers.slice(0, 2) : []).map((customer) => (
                <p className="mt-2" key={customer.id}>
                  {customer.firstName}: {maskEmail(customer.email)} / {maskPhone(customer.phone)}
                </p>
              ))}
              {!showDemoData ? <p className="mt-2">Live customer examples are hidden.</p> : null}
            </div>
          </div>
        </AdminCard>
      </div>

      <AdminCard title="Permission checks for critical actions">
        <AdminTable
          columns={["Action", "Permission key", "Current admin access"]}
          rows={Object.entries(sensitivePermissionMap).map(([permission, label]) => [
            label,
            permission,
            <Badge key="access" tone={session?.permissions.includes(permission as AdminPermission) ? "success" : "sale"}>
              {session?.permissions.includes(permission as AdminPermission) ? "Allowed" : "Blocked"}
            </Badge>
          ])}
        />
      </AdminCard>
    </div>
  );
}

function SecurityAction({ icon, label, onClick }: { icon: ReactNode; label: string; onClick: () => void }) {
  return (
    <button className="focus-ring rounded-md border border-black/10 bg-white p-4 text-left shadow-sm hover:border-forest" onClick={onClick} type="button">
      <span className="text-forest">{icon}</span>
      <span className="mt-3 block text-sm font-black text-ink">{label}</span>
      <span className="mt-1 block text-xs font-semibold text-slate">Control action is audit logged.</span>
    </button>
  );
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
      <ShieldCheck className="h-5 w-5 text-forest" />
      <span>{message}</span>
      <button className="ml-auto text-slate" onClick={onDismiss} type="button">Dismiss</button>
    </div>
  );
}
