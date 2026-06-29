import { AdminDashboardClient } from "@/components/admin/AdminDashboardClient";
import { AdminShell } from "@/components/layout/AdminShell";

export const metadata = {
  title: "Admin Dashboard"
};

export default function AdminDashboardPage() {
  return (
    <AdminShell title="Dashboard">
      <AdminDashboardClient />
    </AdminShell>
  );
}
