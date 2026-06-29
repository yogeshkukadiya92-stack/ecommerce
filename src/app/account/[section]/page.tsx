import { AccountSectionClient } from "@/components/account/AccountClients";
import { SiteShell } from "@/components/layout/SiteShell";

const accountSections = [
  "wishlist",
  "addresses",
  "subscriptions",
  "loyalty",
  "referrals",
  "reviews",
  "profile",
  "notifications"
];

export function generateStaticParams() {
  return accountSections.map((section) => ({ section }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  return {
    title: `${section.replace("-", " ")} | FitSupplement Store`
  };
}

export default async function AccountSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  return (
    <SiteShell>
      <AccountSectionClient section={section} />
    </SiteShell>
  );
}
