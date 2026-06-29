import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function Breadcrumbs({ items }: { items: Array<{ href: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-sm text-slate">
      {items.map((item, index) => (
        <span key={item.href} className="flex items-center gap-1">
          {index > 0 ? <ChevronRight className="h-3.5 w-3.5" /> : null}
          <Link className="font-semibold hover:text-ink" href={item.href}>
            {item.label}
          </Link>
        </span>
      ))}
    </nav>
  );
}
