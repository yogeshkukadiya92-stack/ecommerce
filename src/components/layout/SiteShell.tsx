import type { ReactNode } from "react";
import { getWebsiteStudioData } from "@/lib/cms/cmsRepository";
import { Footer } from "@/components/storefront/Footer";
import { Header } from "@/components/storefront/Header";
import { MobileBottomNav } from "@/components/storefront/MobileBottomNav";

export function SiteShell({ children }: { children: ReactNode }) {
  const cms = getWebsiteStudioData();

  return (
    <div className="min-h-screen bg-mist text-ink">
      <a className="skip-link focus-ring" href="#main-content">
        Skip to content
      </a>
      <Header config={cms.header} />
      <div className="pb-16 lg:pb-0" id="main-content">{children}</div>
      <Footer config={cms.footer} />
      <MobileBottomNav />
    </div>
  );
}
