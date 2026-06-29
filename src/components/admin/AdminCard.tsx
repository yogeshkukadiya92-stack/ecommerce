import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function AdminCard({
  children,
  className,
  title
}: {
  children: ReactNode;
  className?: string;
  title?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-card border border-black/10 bg-white p-5 shadow-sm", className)}>
      {title ? <h2 className="mb-4 text-base font-extrabold tracking-tight text-ink">{title}</h2> : null}
      {children}
    </section>
  );
}
