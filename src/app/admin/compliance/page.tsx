import { ComplianceManagementClient } from "@/components/admin/ComplianceManagementClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function ComplianceAdminPage() {
  return (
    <AdminShell title="Compliance">
      <ComplianceManagementClient />
    </AdminShell>
  );
}
