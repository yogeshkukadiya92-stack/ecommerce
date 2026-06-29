import type { HomepageSection, WebsiteStudioData } from "@/types/cms";

export const WEBSITE_STUDIO_STORAGE_KEY = "fitsupplement.website-studio.v1";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function readWebsiteStudioDraft(): WebsiteStudioData | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(WEBSITE_STUDIO_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as WebsiteStudioData;
  } catch {
    return null;
  }
}

export function writeWebsiteStudioDraft(data: WebsiteStudioData) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(WEBSITE_STUDIO_STORAGE_KEY, JSON.stringify(data));
  window.dispatchEvent(new CustomEvent("fitsupplement:website-studio"));
}

export function getPublishedLocalHomepageSections(fallback: HomepageSection[]) {
  const draft = readWebsiteStudioDraft();

  if (!draft) return fallback;

  return draft.homepageSections
    .filter((section) => section.enabled && section.status === "published")
    .sort((first, second) => first.order - second.order);
}
