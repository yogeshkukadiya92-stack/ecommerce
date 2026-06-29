import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  description: "Guest checkout, saved address checkout, secure online payments, COD, and order summary for FitSupplement Store.",
  title: "Checkout"
};

export default function CheckoutPage() {
  return (
    <SiteShell>
      <CheckoutClient />
    </SiteShell>
  );
}
