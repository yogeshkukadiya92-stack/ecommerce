import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function AdminCard({
  children,
  className,
  description,
  action,
  title
}: {
  children: ReactNode;
  className?: string;
  description?: string;
  action?: ReactNode;
  title?: string;
}) {
  return (
    <section className={cn("min-w-0 rounded-card border border-black/10 bg-white p-5 shadow-sm transition hover:border-forest/15 hover:shadow-card", className)}>
      {title || description || action ? (
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <h2 className="text-base font-extrabold tracking-tight text-ink">{title}</h2> : null}
            {description ? <p className="mt-1 max-w-2xl text-sm leading-6 text-slate">{description}</p> : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
