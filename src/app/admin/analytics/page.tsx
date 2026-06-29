import { AnalyticsDashboardClient } from "@/components/admin/AnalyticsDashboardClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function AnalyticsAdminPage() {
  return (
    <AdminShell title="Analytics">
      <AnalyticsDashboardClient />
    </AdminShell>
  );
}
