import { ShoppingCart } from "lucide-react";

export function StickyMobileCTA() {
  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-black/10 bg-white p-3 shadow-2xl lg:hidden">
      <button
        className="focus-ring flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ink text-sm font-black text-white"
        type="button"
      >
        <ShoppingCart className="h-4 w-4" /> Add selected stack to cart
      </button>
    </div>
  );
}
