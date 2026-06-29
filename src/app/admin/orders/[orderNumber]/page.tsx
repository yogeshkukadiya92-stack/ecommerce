import { OrderManagementClient } from "@/components/admin/OrderManagementClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default async function AdminOrderDetailPage({
  params
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  return (
    <AdminShell title={`Order ${orderNumber}`}>
      <OrderManagementClient initialOrderNumber={decodeURIComponent(orderNumber)} />
    </AdminShell>
  );
}
