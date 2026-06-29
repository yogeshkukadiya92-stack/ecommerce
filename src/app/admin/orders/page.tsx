import { OrderManagementClient } from "@/components/admin/OrderManagementClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function OrdersAdminPage() {
  return (
    <AdminShell title="Orders">
      <OrderManagementClient />
    </AdminShell>
  );
}
