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
        "inline-flex items-center rounded-md px-2 py-1 text-xs font-bold",
        tone === "neutral" && "bg-cloud text-graphite",
        tone === "success" && "bg-mint text-forest",
        tone === "sale" && "bg-coral text-white",
        tone === "dark" && "bg-ink text-white"
      )}
    >
      {children}
    </span>
  );
}
