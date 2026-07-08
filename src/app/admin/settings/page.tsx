import { AdminAccessSettingsClient } from "@/components/admin/AdminAccessSettingsClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function SettingsAdminPage() {
  return (
    <AdminShell title="Settings">
      <AdminAccessSettingsClient />
    </AdminShell>
  );
}
