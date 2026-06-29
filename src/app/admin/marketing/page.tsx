import { MarketingAutomationClient } from "@/components/admin/MarketingAutomationClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function MarketingAdminPage() {
  return (
    <AdminShell title="Marketing">
      <MarketingAutomationClient />
    </AdminShell>
  );
}
