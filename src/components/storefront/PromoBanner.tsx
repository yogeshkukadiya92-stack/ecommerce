import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function PromoBanner() {
  return (
    <section className="rounded-card bg-forest p-5 text-white shadow-card sm:p-6">
      <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-xl font-black">Stack smarter this month</h2>
          <p className="mt-1 text-sm text-white/75">
            Save on whey, creatine, and daily wellness essentials. No medical claims, just clearer shopping.
          </p>
        </div>
        <Link className="focus-ring inline-flex items-center gap-2 rounded-md bg-lime px-4 py-3 text-sm font-black text-ink" href="/products">
          Explore deals <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}
