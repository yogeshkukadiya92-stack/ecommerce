import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Badge({
  children,
  tone = "neutral"
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "sale" | "dark";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-1 text-xs font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.45)]",
        tone === "neutral" && "border-black/10 bg-cloud text-graphite",
        tone === "success" && "border-forest/10 bg-mint text-forest",
        tone === "sale" && "border-coral bg-coral text-white",
        tone === "dark" && "border-ink bg-ink text-white"
      )}
    >
      {children}
    </span>
  );
}
