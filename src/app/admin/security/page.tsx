import { SecurityManagementClient } from "@/components/admin/SecurityManagementClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function SecurityAdminPage() {
  return (
    <AdminShell title="Security">
      <SecurityManagementClient />
    </AdminShell>
  );
}
