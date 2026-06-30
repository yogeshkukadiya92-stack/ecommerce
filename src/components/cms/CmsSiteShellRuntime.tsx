"use client";

import { useEffect, useState, type ReactNode } from "react";
import type { FooterCmsConfig, HeaderCmsConfig } from "@/types/cms";
import { readWebsiteStudioDraft } from "@/lib/cms/cmsLocalStorage";
import { Footer } from "@/components/storefront/Footer";
import { Header } from "@/components/storefront/Header";
import { MobileBottomNav } from "@/components/storefront/MobileBottomNav";

export function CmsSiteShellRuntime({
  children,
  footer,
  header
}: {
  children: ReactNode;
  footer: FooterCmsConfig;
  header: HeaderCmsConfig;
}) {
  const [runtimeHeader, setRuntimeHeader] = useState(header);
  const [runtimeFooter, setRuntimeFooter] = useState(footer);

  useEffect(() => {
    function refresh() {
      const draft = readWebsiteStudioDraft();

      setRuntimeHeader(draft?.header ?? header);
      setRuntimeFooter(draft?.footer ?? footer);
    }

    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("fitsupplement:website-studio", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("fitsupplement:website-studio", refresh);
    };
  }, [footer, header]);

  return (
    <div className="min-h-screen bg-mist text-ink">
      <a className="skip-link focus-ring" href="#main-content">
        Skip to content
      </a>
      <Header config={runtimeHeader} />
      <div className="pb-16 lg:pb-0" id="main-content">{children}</div>
      <Footer config={runtimeFooter} />
      <MobileBottomNav />
    </div>
  );
}
