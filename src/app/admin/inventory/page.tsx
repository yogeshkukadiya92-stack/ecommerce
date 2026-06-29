import { InventoryManagementClient } from "@/components/admin/InventoryManagementClient";
import { AdminShell } from "@/components/layout/AdminShell";

export const metadata = {
  title: "Inventory Management"
};

export default function InventoryAdminPage() {
  return (
    <AdminShell title="Inventory management">
      <InventoryManagementClient />
    </AdminShell>
  );
}
