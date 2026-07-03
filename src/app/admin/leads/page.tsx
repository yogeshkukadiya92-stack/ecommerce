import { LeadManagementClient } from "@/components/admin/LeadManagementClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function LeadsAdminPage() {
  return (
    <AdminShell title="WhatsApp Leads">
      <LeadManagementClient />
    </AdminShell>
  );
}
