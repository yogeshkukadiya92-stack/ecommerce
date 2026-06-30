import { WebsiteStudioClient } from "@/components/admin/WebsiteStudioClient";
import { AdminShell } from "@/components/layout/AdminShell";

export const metadata = {
  title: "Alignment"
};

export default function AlignmentAdminPage() {
  return (
    <AdminShell title="Alignment">
      <WebsiteStudioClient autoSaveChanges initialTab="Alignment" tabsLocked />
    </AdminShell>
  );
}
