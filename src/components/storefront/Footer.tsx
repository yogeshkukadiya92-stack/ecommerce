import Link from "next/link";
import { Instagram, Mail, MapPin, Phone } from "lucide-react";
import type { FooterCmsConfig } from "@/types/cms";
import { NewsletterBox } from "./NewsletterBox";

const footerGroups = [
  {
    title: "Shop",
    links: [
      { href: "/categories/protein-powders", label: "Protein Powders" },
      { href: "/categories/performance", label: "Creatine" },
      { href: "/categories/vitamins-wellness", label: "Vitamins" },
      { href: "/categories/fitness-accessories", label: "Accessories" }
    ]
  },
  {
    title: "Collections",
    links: [
      { href: "/collections/best-sellers", label: "Best Sellers" },
      { href: "/collections/new-arrivals", label: "New Arrivals" },
      { href: "/collections/combo-deals", label: "Combo Deals" }
    ]
  },
  {
    title: "Company",
    links: [
      { href: "/products", label: "All Products" },
      { href: "/search", label: "Search" },
      { href: "/admin", label: "Admin" }
    ]
  }
];

export function Footer({ config }: { config?: FooterCmsConfig }) {
  const footerColumns = config?.footerColumns.filter((column) => column.enabled) ?? footerGroups;

  return (
    <footer className="border-t border-black/10 bg-ink text-white">
      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1.1fr_1.4fr]">
        <div>
          <h2 className="text-2xl font-black">FitSupplement Store</h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/70">
            {config?.description ??
              "Premium sports nutrition and wellness essentials with transparent labels, batch-aware inventory, and trustworthy shopping flows."}
          </p>
          <div className="mt-5 grid gap-2 text-sm text-white/75">
            <span className="flex items-center gap-2"><Phone className="h-4 w-4 text-lime" /> {config?.contactPhone ?? "+91 90000 00000"}</span>
            <span className="flex items-center gap-2"><Mail className="h-4 w-4 text-lime" /> {config?.contactEmail ?? "care@fitsupplement.example"}</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-lime" /> Mumbai, India</span>
          </div>
        </div>
        <div className="grid gap-8 sm:grid-cols-3">
          {footerColumns.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-black">{group.title}</h3>
              <nav className="mt-4 grid gap-3 text-sm text-white/70">
                {group.links.map((link) => (
                  <Link key={"id" in link ? link.id : link.href} href={"url" in link ? link.url : link.href} className="hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
      </div>
      <div className="container-page border-t border-white/10 py-6">
        <div className="grid gap-5 lg:grid-cols-[1fr_420px] lg:items-center">
          <p className="text-xs leading-5 text-white/60">
            Supplements are not intended to diagnose, treat, cure, or prevent any disease.
          </p>
          <NewsletterBox dark />
        </div>
        <div className="mt-5 flex items-center justify-between text-xs text-white/50">
          <span>{config?.copyrightText ?? "Copyright 2026 FitSupplement Store"}</span>
          <div className="flex items-center gap-3">
            {config?.paymentIcons.slice(0, 4).map((icon) => (
              <span className="rounded bg-white/10 px-2 py-1 text-[10px] font-black" key={icon}>
                {icon}
              </span>
            ))}
            <Instagram className="h-4 w-4" />
          </div>
        </div>
      </div>
    </footer>
  );
}
