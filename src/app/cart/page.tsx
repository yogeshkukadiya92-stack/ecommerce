import { SiteShell } from "@/components/layout/SiteShell";
import { CartClient } from "@/components/cart/CartClient";

export const metadata = {
  description: "Review your FitSupplement cart, apply coupons, and continue to checkout.",
  title: "Cart"
};

export default function CartPage() {
  return (
    <SiteShell>
      <CartClient />
    </SiteShell>
  );
}
