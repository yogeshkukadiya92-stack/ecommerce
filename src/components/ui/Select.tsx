import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
};

export function Select({ children, className, label, ...props }: SelectProps) {
  return (
    <label className="block">
      {label ? <span className="mb-2 block text-sm font-semibold text-ink">{label}</span> : null}
      <select
        className={cn(
          "focus-ring h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm font-semibold text-ink shadow-sm transition hover:border-forest/40 disabled:cursor-not-allowed disabled:bg-cloud disabled:text-slate",
          className
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
