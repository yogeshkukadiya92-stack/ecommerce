import { WebsiteStudioClient } from "@/components/admin/WebsiteStudioClient";
import { AdminShell } from "@/components/layout/AdminShell";

export const metadata = {
  title: "Website Editor"
};

export default function AlignmentAdminPage() {
  return (
    <AdminShell title="Website Editor">
      <WebsiteStudioClient autoSaveChanges initialTab="Alignment" />
    </AdminShell>
  );
}
