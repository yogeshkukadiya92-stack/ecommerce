import { CatalogManagementClient } from "@/components/admin/CatalogManagementClient";
import { AdminShell } from "@/components/layout/AdminShell";

export const metadata = {
  title: "Catalog Management | FitSupplement Store"
};

export default function CatalogAdminPage() {
  return (
    <AdminShell title="Catalog management">
      <CatalogManagementClient />
    </AdminShell>
  );
}
