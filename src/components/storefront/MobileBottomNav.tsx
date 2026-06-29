"use client";

import Link from "next/link";
import { Home, Search, ShoppingBag, ShoppingCart, User } from "lucide-react";

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/products", icon: ShoppingBag, label: "Shop" },
  { href: "/search", icon: Search, label: "Search" },
  { href: "/cart", icon: ShoppingCart, label: "Cart" },
  { href: "/account", icon: User, label: "Account" }
] as const;

export function MobileBottomNav() {
  return (
    <nav
      aria-label="Mobile primary navigation"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-2xl backdrop-blur lg:hidden"
    >
      <div className="grid grid-cols-5 gap-1">
        {navItems.map(({ href, icon: Icon, label }) => (
          <Link
            className="focus-ring flex min-h-12 flex-col items-center justify-center gap-1 rounded-md text-[11px] font-black text-slate hover:bg-mist hover:text-ink"
            href={href}
            key={href}
          >
            <Icon aria-hidden className="h-4 w-4" />
            <span>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
