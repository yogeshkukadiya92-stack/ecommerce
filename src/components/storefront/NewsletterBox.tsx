"use client";

import { useState } from "react";
import { cn } from "@/lib/utils/cn";

export function NewsletterBox({ dark = false }: { dark?: boolean }) {
  const [email, setEmail] = useState("");

  return (
    <form className="grid gap-2 sm:grid-cols-[1fr_auto]">
      <input
        aria-label="Email address"
        className={cn(
          "focus-ring h-11 rounded-md border px-3 text-sm font-medium outline-none",
          dark
            ? "border-white/10 bg-white/10 text-white placeholder:text-white/50"
            : "border-black/10 bg-white text-ink placeholder:text-slate"
        )}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="Email for drops and deals"
        value={email}
      />
      <button
        className="focus-ring h-11 rounded-md bg-lime px-4 text-sm font-black text-ink hover:bg-mint"
        type="button"
      >
        Join
      </button>
    </form>
  );
}
