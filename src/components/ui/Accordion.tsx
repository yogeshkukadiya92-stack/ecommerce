import { ChevronDown } from "lucide-react";

export function Accordion({
  items
}: {
  items: Array<{ title: string; content: string }>;
}) {
  return (
    <div className="divide-y divide-black/10 rounded-card border border-black/10 bg-white">
      {items.map((item, index) => (
        <details key={item.title} className="group" open={index === 0}>
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-sm font-bold text-ink">
            {item.title}
            <ChevronDown className="h-4 w-4 text-slate transition group-open:rotate-180" />
          </summary>
          <p className="px-4 pb-4 text-sm leading-6 text-slate">{item.content}</p>
        </details>
      ))}
    </div>
  );
}
