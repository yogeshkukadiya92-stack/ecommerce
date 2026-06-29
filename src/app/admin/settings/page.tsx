import { AdminModulePlaceholder } from "@/components/admin/AdminModulePlaceholder";
import { AdminShell } from "@/components/layout/AdminShell";

export default function SettingsAdminPage() {
  return (
    <AdminShell title="Settings">
      <AdminModulePlaceholder
        title="Platform settings"
        description="Settings are prepared for RBAC, payment providers, courier providers, storage, search, SEO, and compliance controls."
        modules={["Roles", "Permissions", "Payments", "Shipping", "Storage", "Search", "Compliance"]}
      />
    </AdminShell>
  );
}
