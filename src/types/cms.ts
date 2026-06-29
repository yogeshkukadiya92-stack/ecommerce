export type CmsPublishStatus = "draft" | "scheduled" | "published" | "unpublished";

export type HomepageSectionType =
  | "hero_banner"
  | "image_banner"
  | "category_grid"
  | "brand_carousel"
  | "product_carousel"
  | "collection_carousel"
  | "goal_cards"
  | "flash_sale"
  | "trust_badges"
  | "testimonials"
  | "blog_preview"
  | "newsletter"
  | "video_section"
  | "custom_html";

export type CmsBackgroundStyle = "white" | "mist" | "ink" | "mint" | "image";

export type CmsContentReference = {
  id: string;
  label: string;
  type: "product" | "category" | "brand" | "collection" | "blog" | "page" | "custom_url";
  url?: string;
};

export type HomepageSection = {
  backgroundStyle: CmsBackgroundStyle;
  ctaLabel?: string;
  ctaLink?: string;
  desktopImageUrl?: string;
  enabled: boolean;
  id: string;
  mobileImageUrl?: string;
  order: number;
  previewNote?: string;
  publishAt?: string;
  references: CmsContentReference[];
  status: CmsPublishStatus;
  subtitle?: string;
  title: string;
  type: HomepageSectionType;
  videoUrl?: string;
};

export type MenuLinkType = "category" | "brand" | "page" | "custom_url";

export type CmsMenuItem = {
  children?: CmsMenuItem[];
  enabled: boolean;
  id: string;
  label: string;
  linkType: MenuLinkType;
  url: string;
};

export type HeaderCmsConfig = {
  announcementText: string;
  announcementUrl?: string;
  enableAccount: boolean;
  enableCart: boolean;
  enableSearch: boolean;
  enableWishlist: boolean;
  logoAlt: string;
  logoText: string;
  logoUrl?: string;
  megaMenuItems: CmsMenuItem[];
};

export type FooterColumn = {
  enabled: boolean;
  id: string;
  links: Array<{
    id: string;
    label: string;
    url: string;
  }>;
  title: string;
};

export type FooterCmsConfig = {
  contactEmail: string;
  contactPhone: string;
  copyrightText: string;
  description: string;
  footerColumns: FooterColumn[];
  newsletterText: string;
  paymentIcons: string[];
  socialLinks: Array<{
    id: string;
    label: string;
    url: string;
  }>;
};

export type CmsBanner = {
  active: boolean;
  ctaLabel: string;
  ctaLink: string;
  desktopImageUrl: string;
  endDate?: string;
  id: string;
  mobileImageUrl?: string;
  startDate?: string;
  targetPage: "homepage" | "product_listing" | "cart" | "all";
  title: string;
};

export type CmsPageSection = Pick<
  HomepageSection,
  "backgroundStyle" | "ctaLabel" | "ctaLink" | "desktopImageUrl" | "enabled" | "id" | "order" | "references" | "subtitle" | "title" | "type"
>;

export type LandingPage = {
  id: string;
  sections: CmsPageSection[];
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: CmsPublishStatus;
  title: string;
};

export type BlogPostCms = {
  author: string;
  category: string;
  content: string;
  disclaimerEnabled: boolean;
  featuredImageUrl?: string;
  id: string;
  publishedAt?: string;
  relatedProductIds: string[];
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: CmsPublishStatus;
  title: string;
};

export type PolicyPageCms = {
  content: string;
  id: string;
  seoDescription: string;
  seoTitle: string;
  slug: string;
  status: CmsPublishStatus;
  title: string;
};

export type PopupCmsConfig = {
  active: boolean;
  displayRules: string[];
  id: string;
  title: string;
  type: "newsletter" | "coupon" | "exit_intent";
};

export type SeoConfig = {
  canonicalUrl?: string;
  metaDescription: string;
  noindex: boolean;
  ogImageUrl?: string;
  pageKey: string;
  structuredDataPlaceholder?: string;
  title: string;
};

export type CmsVersionEntry = {
  action: "draft_saved" | "published" | "rollback_placeholder";
  at: string;
  editedBy: string;
  entityId: string;
  id: string;
  note: string;
};

export type WebsiteStudioData = {
  banners: CmsBanner[];
  blogPosts: BlogPostCms[];
  footer: FooterCmsConfig;
  header: HeaderCmsConfig;
  homepageSections: HomepageSection[];
  landingPages: LandingPage[];
  policies: PolicyPageCms[];
  popups: PopupCmsConfig[];
  seo: SeoConfig[];
  versionHistory: CmsVersionEntry[];
};
