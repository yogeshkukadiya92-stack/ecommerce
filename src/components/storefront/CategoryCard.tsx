import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { Category } from "@/types";

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link
      className="group rounded-card border border-black/10 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
      href={`/products?category=${category.slug}`}
    >
      <div className="flex aspect-[4/3] items-end rounded-md bg-gradient-to-br from-mint to-cloud p-4">
        <span className="rounded bg-white px-2 py-1 text-xs font-extrabold text-forest">
          {category.name}
        </span>
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-extrabold text-ink">{category.name}</h3>
          <p className="mt-1 text-sm leading-5 text-slate">{category.description}</p>
        </div>
        <ArrowUpRight className="h-5 w-5 shrink-0 text-slate transition group-hover:text-forest" />
      </div>
    </Link>
  );
}
