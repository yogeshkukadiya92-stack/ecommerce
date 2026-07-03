import Link from "next/link";
import { CheckCircle2, Database, ExternalLink, ShieldCheck } from "lucide-react";
import { liveDataModeLabel } from "@/lib/admin/liveData";

export function LiveAdminEmptyState({
  actionHref = "/admin/settings",
  actionLabel = "Review settings",
  description,
  title
}: {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  title: string;
}) {
  return (
    <section className="overflow-hidden rounded-card border border-black/10 bg-white shadow-card">
      <div className="grid gap-0 lg:grid-cols-[1fr_360px]">
        <div className="p-6 sm:p-8">
          <span className="inline-flex items-center gap-2 rounded-md bg-mint px-3 py-2 text-xs font-black uppercase tracking-[0.08em] text-forest">
            <ShieldCheck className="h-4 w-4" />
            {liveDataModeLabel()}
          </span>
          <h2 className="mt-5 max-w-2xl text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">{title}</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate">{description}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link className="focus-ring inline-flex items-center justify-center rounded-md bg-ink px-4 py-3 text-sm font-black text-white" href={actionHref}>
              {actionLabel}
            </Link>
            <Link className="focus-ring inline-flex items-center gap-2 rounded-md border border-black/10 bg-white px-4 py-3 text-sm font-black text-ink" href="/" target="_blank" rel="noreferrer">
              <ExternalLink className="h-4 w-4" />
              Open storefront
            </Link>
          </div>
        </div>
        <div className="border-t border-black/10 bg-mist p-6 lg:border-l lg:border-t-0">
          <div className="rounded-card border border-black/10 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-md bg-ink text-white">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-black text-ink">Ready for real data</p>
                <p className="text-xs font-semibold text-slate">No demo records are shown in live mode.</p>
              </div>
            </div>
            <ul className="mt-5 grid gap-3 text-sm font-semibold text-graphite">
              {["MongoDB connected through DATABASE_URL", "Admin credentials loaded from private env", "Demo data hidden unless explicitly enabled"].map((item) => (
                <li className="flex items-start gap-2" key={item}>
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-forest" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
