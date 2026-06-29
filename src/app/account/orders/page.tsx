import { AccountOrdersClient } from "@/components/account/AccountClients";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  title: "My Orders | FitSupplement Store"
};

export default function AccountOrdersPage() {
  return (
    <SiteShell>
      <AccountOrdersClient />
    </SiteShell>
  );
}
