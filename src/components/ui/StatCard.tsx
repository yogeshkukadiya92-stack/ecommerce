import { cn } from "@/lib/utils/cn";

export function StatCard({
  label,
  value,
  tone = "neutral"
}: {
  label: string;
  value: string | number;
  tone?: "neutral" | "forest" | "coral";
}) {
  return (
    <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-slate">{label}</p>
      <p
        className={cn(
          "mt-3 text-3xl font-black tracking-tight",
          tone === "forest" && "text-forest",
          tone === "coral" && "text-coral",
          tone === "neutral" && "text-ink"
        )}
      >
        {value}
      </p>
    </div>
  );
}
