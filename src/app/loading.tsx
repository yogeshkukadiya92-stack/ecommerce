import { SiteShell } from "@/components/layout/SiteShell";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <SiteShell>
      <main className="container-page py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
