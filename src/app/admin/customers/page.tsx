import { CustomerCrmClient } from "@/components/admin/CustomerCrmClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function CustomersAdminPage() {
  return (
    <AdminShell title="Customers">
      <CustomerCrmClient />
    </AdminShell>
  );
}
