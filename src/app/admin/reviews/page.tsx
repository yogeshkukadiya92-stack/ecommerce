import { ReviewsModerationClient } from "@/components/admin/ReviewsModerationClient";
import { AdminShell } from "@/components/layout/AdminShell";

export default function ReviewsAdminPage() {
  return (
    <AdminShell title="Reviews">
      <ReviewsModerationClient />
    </AdminShell>
  );
}
