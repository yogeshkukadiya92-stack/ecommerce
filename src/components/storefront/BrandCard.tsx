import type { Brand } from "@/types";

export function BrandCard({ brand }: { brand: Brand }) {
  return (
    <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
      <div className="flex h-12 w-12 items-center justify-center rounded-md bg-ink text-sm font-extrabold text-lime">
        {brand.name.slice(0, 2).toUpperCase()}
      </div>
      <h3 className="mt-4 text-base font-extrabold text-ink">{brand.name}</h3>
      <p className="mt-2 text-sm leading-6 text-slate">{brand.description}</p>
    </div>
  );
}
