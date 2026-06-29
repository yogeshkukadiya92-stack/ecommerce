import { WebsiteStudioClient } from "@/components/admin/WebsiteStudioClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function ContentAdminPage() {
  return (
    <AdminShell title="Website Studio">
      <WebsiteStudioClient />
    </AdminShell>
  );
}
