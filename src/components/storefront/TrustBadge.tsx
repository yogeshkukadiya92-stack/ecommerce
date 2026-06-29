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
    <div className="flex items-start gap-3 rounded-card border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-mint text-forest">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-sm font-black text-ink">{title}</p>
        <p className="mt-1 text-xs leading-5 text-slate">{description}</p>
      </div>
    </div>
  );
}
