"use client";

import type { InputHTMLAttributes } from "react";
import { useId, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  error?: string;
  helperText?: string;
  label: string;
};

export function PasswordInput({ className, error, helperText, id, label, ...props }: PasswordInputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const helperId = `${inputId}-helper`;
  const [isVisible, setIsVisible] = useState(false);
  const Icon = isVisible ? EyeOff : Eye;

  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <div className="relative">
        <input
          aria-describedby={error || helperText ? helperId : undefined}
          aria-invalid={error ? true : undefined}
          className={cn(
            "focus-ring h-11 w-full rounded-md border bg-white px-3 pr-11 text-sm font-semibold text-ink shadow-sm transition placeholder:font-medium placeholder:text-slate hover:border-forest/40 disabled:cursor-not-allowed disabled:bg-cloud disabled:text-slate",
            error ? "border-coral bg-coral/5" : "border-black/10",
            className
          )}
          id={inputId}
          type={isVisible ? "text" : "password"}
          {...props}
        />
        <button
          aria-label={isVisible ? "Hide password" : "Show password"}
          className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-slate transition hover:bg-mist hover:text-ink"
          onClick={() => setIsVisible((current) => !current)}
          type="button"
        >
          <Icon className="h-4 w-4" />
        </button>
      </div>
      {error ? (
        <span className="mt-2 block text-xs font-semibold text-coral" id={helperId}>{error}</span>
      ) : helperText ? (
        <span className="mt-2 block text-xs text-slate" id={helperId}>{helperText}</span>
      ) : null}
    </label>
  );
}

