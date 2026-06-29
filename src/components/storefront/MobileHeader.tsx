"use client";

import Link from "next/link";
import { Menu, Search, ShoppingCart, Sparkles, User, X } from "lucide-react";
import { useState } from "react";
import { categories } from "@/mock";
import type { HeaderCmsConfig } from "@/types/cms";
import { SearchBar } from "./SearchBar";

export function MobileHeader({ config }: { config?: HeaderCmsConfig }) {
  const [open, setOpen] = useState(false);
  const menuItems = config?.megaMenuItems.filter((item) => item.enabled);

  return (
    <div className="lg:hidden">
      <div className="flex h-16 items-center justify-between gap-3 border-b border-black/10 bg-white px-4">
        <button
          aria-label="Open menu"
          className="focus-ring rounded-md p-2 text-ink"
          onClick={() => setOpen(true)}
          type="button"
        >
          <Menu className="h-5 w-5" />
        </button>
        <Link className="flex min-w-0 items-center gap-2 text-base font-extrabold tracking-tight text-ink" href="/">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-ink text-lime">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="truncate">{config?.logoText ?? "FitSupplement"}</span>
        </Link>
        <div className="flex items-center gap-1">
          {config?.enableAccount === false ? null : (
            <Link className="focus-ring rounded-md p-2 text-ink" href="/login" aria-label="Account">
              <User className="h-5 w-5" />
            </Link>
          )}
          {config?.enableCart === false ? null : (
            <Link className="focus-ring rounded-md p-2 text-ink" href="/cart" aria-label="Cart">
              <ShoppingCart className="h-5 w-5" />
            </Link>
          )}
        </div>
      </div>
      {config?.enableSearch === false ? null : (
        <div className="border-b border-black/10 bg-white px-4 py-3">
          <SearchBar compact label="Search supplements mobile" />
        </div>
      )}
      {open ? (
        <div className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm">
          <div className="h-full w-[88vw] max-w-sm overflow-y-auto bg-white p-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-lg font-black text-ink">Shop menu</span>
              <button
                aria-label="Close menu"
                className="focus-ring rounded-md p-2 text-ink"
                onClick={() => setOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <Link className="mt-5 flex items-center gap-2 rounded-md bg-mist px-4 py-3 text-sm font-black text-ink" href="/search">
              <Search className="h-4 w-4 text-forest" /> Search products
            </Link>
            <nav className="mt-6 grid gap-2">
              <Link className="rounded-md bg-ink px-4 py-3 text-sm font-bold text-white" href="/products">
                Shop all supplements
              </Link>
              {(menuItems?.length ? menuItems : categories).map((item) => {
                const href = "url" in item ? item.url : `/categories/${item.slug}`;
                const label = "label" in item ? item.label : item.name;

                return (
                  <Link
                    key={item.id}
                    className="rounded-md border border-black/10 px-4 py-3 text-sm font-bold text-ink"
                    href={href}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 rounded-card bg-mist p-4 text-sm leading-6 text-slate">
              Authentic products, secure payments, fast delivery, and easy returns.
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
