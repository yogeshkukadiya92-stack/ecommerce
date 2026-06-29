import { PromotionsManagementClient } from "@/components/admin/PromotionsManagementClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function CouponsAdminPage() {
  return (
    <AdminShell title="Promotions">
      <PromotionsManagementClient />
    </AdminShell>
  );
}
