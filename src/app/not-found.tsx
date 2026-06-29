import { SiteShell } from "@/components/layout/SiteShell";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";

export default function NotFound() {
  return (
    <SiteShell>
      <main className="container-page py-16">
        <EmptyState
          action={<Button href="/" variant="dark">Back to home</Button>}
          title="Page not found"
          description="The page may have moved, or the supplement stack you are looking for is not available yet."
        />
      </main>
    </SiteShell>
  );
}
