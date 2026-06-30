import type { ReactNode } from "react";
import { CmsSiteShellRuntime } from "@/components/cms/CmsSiteShellRuntime";
import { getWebsiteStudioData } from "@/lib/cms/cmsRepository";

export function SiteShell({ children }: { children: ReactNode }) {
  const cms = getWebsiteStudioData();

  return (
    <CmsSiteShellRuntime footer={cms.footer} header={cms.header}>
      {children}
    </CmsSiteShellRuntime>
  );
}
