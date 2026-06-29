import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { categories, brands } from "@/mock";
import type { CmsMenuItem } from "@/types/cms";

export function MegaMenu({ items }: { items?: CmsMenuItem[] }) {
  const enabledItems = items?.filter((item) => item.enabled);

  return (
    <div className="hidden border-b border-black/10 bg-white lg:block">
      <div className="container-page flex h-12 items-center justify-between">
        <nav className="flex items-center gap-7 text-sm font-bold text-graphite">
          {enabledItems?.length ? (
            enabledItems.map((item, index) => (
              <Link className={index === 0 ? "flex items-center gap-1 text-ink" : "hover:text-forest"} href={item.url} key={item.id}>
                {item.label} {item.children?.length ? <ChevronDown className="h-4 w-4" /> : null}
              </Link>
            ))
          ) : (
            <>
              <Link className="flex items-center gap-1 text-ink" href="/products">
                Shop all <ChevronDown className="h-4 w-4" />
              </Link>
              {categories.map((category) => (
                <Link key={category.id} className="hover:text-forest" href={`/categories/${category.slug}`}>
                  {category.name}
                </Link>
              ))}
            </>
          )}
        </nav>
        <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.12em] text-slate">
          {(enabledItems?.length ? enabledItems.slice(0, 3) : brands.slice(0, 3)).map((item) => (
            <Link key={item.id} className="hover:text-ink" href={"url" in item ? item.url : `/brands/${item.slug}`}>
              {"name" in item ? item.name : item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
