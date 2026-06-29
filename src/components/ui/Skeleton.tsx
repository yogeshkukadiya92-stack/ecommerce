import { cn } from "@/lib/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-cloud", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-card border border-black/10 bg-white p-3 shadow-sm">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="mt-4 h-4 w-2/3" />
      <Skeleton className="mt-3 h-3 w-full" />
      <Skeleton className="mt-2 h-3 w-5/6" />
      <Skeleton className="mt-5 h-10 w-full" />
    </div>
  );
}
