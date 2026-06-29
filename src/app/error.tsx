"use client";

import { SiteShell } from "@/components/layout/SiteShell";
import { ErrorState } from "@/components/ui/ErrorState";

export default function ErrorPage() {
  return (
    <SiteShell>
      <main className="container-page py-16">
        <ErrorState />
      </main>
    </SiteShell>
  );
}
