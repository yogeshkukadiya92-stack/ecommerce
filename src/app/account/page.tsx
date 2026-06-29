import { AccountDashboardClient } from "@/components/account/AccountClients";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  title: "Account | FitSupplement Store"
};

export default function AccountPage() {
  return (
    <SiteShell>
      <AccountDashboardClient />
    </SiteShell>
  );
}
