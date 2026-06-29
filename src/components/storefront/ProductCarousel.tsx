import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Product } from "@/types";
import { ProductCard } from "./ProductCard";

export function ProductCarousel({ products }: { products: Product[] }) {
  return (
    <div>
      <div className="mb-4 hidden justify-end gap-2 sm:flex">
        <button className="focus-ring rounded-md border border-black/10 bg-white p-2 text-slate" type="button">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button className="focus-ring rounded-md border border-black/10 bg-white p-2 text-slate" type="button">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid auto-cols-[82%] grid-flow-col gap-4 overflow-x-auto pb-3 sm:auto-cols-[45%] lg:grid-flow-row lg:grid-cols-4 lg:overflow-visible lg:pb-0">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
