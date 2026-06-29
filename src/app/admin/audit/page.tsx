import { AuditLogClient } from "@/components/admin/AuditLogClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AuditAdminPage() {
  return (
    <AdminShell title="Audit Logs">
      <AuditLogClient />
    </AdminShell>
  );
}
