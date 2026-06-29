import { CheckoutClient } from "@/components/checkout/CheckoutClient";
import { SiteShell } from "@/components/layout/SiteShell";

export const metadata = {
  description: "Guest and logged-in checkout with mock payment and COD placeholders.",
  title: "Checkout | FitSupplement Store"
};

export default function CheckoutPage() {
  return (
    <SiteShell>
      <CheckoutClient />
    </SiteShell>
  );
}
