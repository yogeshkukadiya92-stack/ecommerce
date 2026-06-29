"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";

export function QuantitySelector({ initial = 1 }: { initial?: number }) {
  const [quantity, setQuantity] = useState(initial);

  return (
    <div className="inline-grid h-10 grid-cols-[40px_44px_40px] overflow-hidden rounded-md border border-black/10 bg-white">
      <button
        className="focus-ring flex items-center justify-center text-slate hover:bg-mist"
        onClick={() => setQuantity((value) => Math.max(1, value - 1))}
        type="button"
      >
        <Minus className="h-4 w-4" />
      </button>
      <output className="flex items-center justify-center text-sm font-black text-ink">
        {quantity}
      </output>
      <button
        className="focus-ring flex items-center justify-center text-slate hover:bg-mist"
        onClick={() => setQuantity((value) => value + 1)}
        type="button"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
