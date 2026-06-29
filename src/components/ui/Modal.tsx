import type { ReactNode } from "react";
import { X } from "lucide-react";

export function Modal({
  children,
  title
}: {
  children: ReactNode;
  title: string;
}) {
  return (
    <div aria-labelledby="modal-title" aria-modal="true" className="rounded-card border border-black/10 bg-white p-4 shadow-card" role="dialog">
      <div className="flex items-center justify-between gap-4 border-b border-black/10 pb-3">
        <h3 className="text-sm font-bold text-ink" id="modal-title">{title}</h3>
        <button className="focus-ring rounded-md p-2 text-slate hover:bg-mist" type="button">
          <X className="h-4 w-4" aria-hidden />
          <span className="sr-only">Close</span>
        </button>
      </div>
      <div className="pt-4">{children}</div>
    </div>
  );
}
