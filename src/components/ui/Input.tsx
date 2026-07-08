import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  helperText?: string;
  error?: string;
};

export function Input({ className, error, helperText, label, id, ...props }: InputProps) {
  const inputId = id ?? props.name;
  const helperId = inputId ? `${inputId}-helper` : undefined;

  return (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      ) : null}
      <input
        aria-describedby={error || helperText ? helperId : undefined}
        aria-invalid={error ? true : undefined}
        id={inputId}
        className={cn(
          "focus-ring h-11 w-full rounded-md border bg-white px-3 text-sm font-semibold text-ink shadow-sm transition placeholder:font-medium placeholder:text-slate hover:border-forest/40 disabled:cursor-not-allowed disabled:bg-cloud disabled:text-slate",
          error ? "border-coral bg-coral/5" : "border-black/10",
          className
        )}
        {...props}
      />
      {error ? (
        <span className="mt-2 block text-xs font-semibold text-coral" id={helperId}>{error}</span>
      ) : helperText ? (
        <span className="mt-2 block text-xs text-slate" id={helperId}>{helperText}</span>
      ) : null}
    </label>
  );
}
