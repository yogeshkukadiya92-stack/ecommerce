import type { LucideIcon } from "lucide-react";

export function TrustBadge({
  description,
  icon: Icon,
  title
}: {
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex h-full items-start gap-3 rounded-card border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-ink text-lime">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-base font-extrabold text-ink">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate">{description}</p>
      </div>
    </div>
  );
}
