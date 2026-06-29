import { websiteStudioData } from "@/mock/cms";
import type { BlogPostCms, HomepageSection, PolicyPageCms, WebsiteStudioData } from "@/types/cms";

export function getWebsiteStudioData(): WebsiteStudioData {
  return websiteStudioData;
}

export function getPublishedHomepageSections(): HomepageSection[] {
  return websiteStudioData.homepageSections
    .filter((section) => section.enabled && section.status === "published")
    .sort((first, second) => first.order - second.order);
}

export function getPublishedBlogPost(slug: string): BlogPostCms | undefined {
  return websiteStudioData.blogPosts.find((post) => post.slug === slug && post.status === "published");
}

export function getPublishedBlogPosts(): BlogPostCms[] {
  return websiteStudioData.blogPosts.filter((post) => post.status === "published");
}

export function getPublishedPolicyPage(slug: string): PolicyPageCms | undefined {
  return websiteStudioData.policies.find((page) => page.slug === slug && page.status === "published");
}

export function getPublishedPolicyPages(): PolicyPageCms[] {
  return websiteStudioData.policies.filter((page) => page.status === "published");
}
