"use client";

import { useEffect, useState } from "react";
import type { HomepageSection } from "@/types/cms";
import { getPublishedLocalHomepageSections } from "@/lib/cms/cmsLocalStorage";
import { HomepageSectionRenderer } from "./HomepageSectionRenderer";

export function CmsHomepageRuntime({ sections }: { sections: HomepageSection[] }) {
  const [runtimeSections, setRuntimeSections] = useState(sections);

  useEffect(() => {
    function refresh() {
      setRuntimeSections(getPublishedLocalHomepageSections(sections));
    }

    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("fitsupplement:website-studio", refresh);

    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("fitsupplement:website-studio", refresh);
    };
  }, [sections]);

  return <HomepageSectionRenderer sections={runtimeSections} />;
}
