import { AccountOrderDetailClient } from "@/components/account/AccountClients";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  title: "Order Detail"
};

export default async function AccountOrderDetailPage({
  params
}: {
  params: Promise<{
    orderNumber: string;
  }>;
}) {
  const { orderNumber } = await params;

  return (
    <SiteShell>
      <AccountOrderDetailClient orderNumber={orderNumber} />
    </SiteShell>
  );
}
