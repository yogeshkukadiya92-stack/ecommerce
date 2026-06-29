import { Suspense } from "react";
import { CheckoutFailureClient } from "@/components/checkout/CheckoutResultClient";
import { SiteShell } from "@/components/layout/SiteShell";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata = {
  title: "Order Failure | FitSupplement Store"
};

export default function CheckoutFailurePage() {
  return (
    <SiteShell>
      <Suspense fallback={<main className="container-page py-16"><Skeleton className="h-80" /></main>}>
        <CheckoutFailureClient />
      </Suspense>
    </SiteShell>
  );
}
