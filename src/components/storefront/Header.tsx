import Link from "next/link";
import { Heart, ShieldCheck, ShoppingCart, User } from "lucide-react";
import type { HeaderCmsConfig } from "@/types/cms";
import { SearchBar } from "./SearchBar";
import { MegaMenu } from "./MegaMenu";
import { MobileHeader } from "./MobileHeader";

export function Header({ config }: { config?: HeaderCmsConfig }) {
  const announcement = config?.announcementText ?? "Free shipping above Rs 1,999";
  const logoText = config?.logoText ?? "FitSupplement Store";

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur">
      <div className="bg-ink text-white">
        <div className="container-page flex h-9 items-center justify-center gap-2 text-center text-xs font-bold sm:justify-between">
          {config?.announcementUrl ? (
            <Link href={config.announcementUrl}>{announcement}</Link>
          ) : (
            <span>{announcement}</span>
          )}
          <span className="hidden items-center gap-2 sm:flex">
            <ShieldCheck className="h-4 w-4 text-lime" /> Authenticity checked batches
          </span>
        </div>
      </div>
      <MobileHeader config={config} />
      <div className="hidden border-b border-black/10 bg-white lg:block">
        <div className="container-page grid h-20 grid-cols-[220px_1fr_auto] items-center gap-6">
          <Link className="text-xl font-black tracking-tight text-ink" href="/">
            {logoText}
          </Link>
          {config?.enableSearch === false ? <div /> : <SearchBar label="Search supplements desktop" />}
          <div className="flex items-center gap-2">
            {config?.enableAccount === false ? null : (
              <Link className="focus-ring rounded-md p-2 text-slate hover:bg-mist hover:text-ink" href="/login" aria-label="Account">
                <User className="h-5 w-5" />
              </Link>
            )}
            {config?.enableWishlist === false ? null : (
              <Link className="focus-ring rounded-md p-2 text-slate hover:bg-mist hover:text-ink" href="/account/wishlist" aria-label="Wishlist">
                <Heart className="h-5 w-5" />
              </Link>
            )}
            {config?.enableCart === false ? null : (
              <Link className="focus-ring flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-bold text-white" href="/cart">
                <ShoppingCart className="h-4 w-4" /> Cart
              </Link>
            )}
          </div>
        </div>
      </div>
      <MegaMenu items={config?.megaMenuItems} />
    </header>
  );
}
