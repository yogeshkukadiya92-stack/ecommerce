import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function Tabs({
  tabs,
  active = 0
}: {
  tabs: Array<{ label: string; content: ReactNode }>;
  active?: number;
}) {
  return (
    <div>
      <div className="flex rounded-md border border-black/10 bg-white p-1">
        {tabs.map((tab, index) => (
          <button
            key={tab.label}
            className={cn(
              "focus-ring min-h-9 flex-1 rounded px-3 text-sm font-bold",
              index === active ? "bg-ink text-white" : "text-slate hover:bg-mist hover:text-ink"
            )}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-4 rounded-card border border-black/10 bg-white p-4 text-sm text-slate">
        {tabs[active]?.content}
      </div>
    </div>
  );
}
