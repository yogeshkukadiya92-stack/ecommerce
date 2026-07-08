import type { MetadataRoute } from "next";
import { brands } from "@/mock/brands";
import { categories } from "@/mock/categories";
import { collectionDefinitions } from "@/mock/storefront";
import { getPublishedBlogPosts, getPublishedPolicyPages } from "@/lib/cms/cmsRepository";
import { absoluteUrl } from "@/lib/seo/seo";
import { getLiveStorefrontProducts } from "@/lib/storefront/liveCatalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = ["", "/products", "/search", "/blog"].map((path) => sitemapEntry(path));
  const liveProducts = await getLiveStorefrontProducts().catch(() => []);
  const productRoutes = liveProducts.map((product) => sitemapEntry(`/products/${product.slug}`, "daily"));
  const categoryRoutes = categories.map((category) => sitemapEntry(`/categories/${category.slug}`, "weekly"));
  const brandRoutes = brands.map((brand) => sitemapEntry(`/brands/${brand.slug}`, "weekly"));
  const collectionRoutes = collectionDefinitions.map((collection) => sitemapEntry(`/collections/${collection.slug}`, "weekly"));
  const blogRoutes = getPublishedBlogPosts().map((post) => sitemapEntry(`/blog/${post.slug}`, "monthly"));
  const policyRoutes = getPublishedPolicyPages().map((page) => sitemapEntry(`/pages/${page.slug}`, "monthly"));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...brandRoutes,
    ...collectionRoutes,
    ...blogRoutes,
    ...policyRoutes
  ];
}

function sitemapEntry(path: string, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "weekly") {
  return {
    changeFrequency,
    lastModified: new Date("2026-06-29"),
    priority: path === "" ? 1 : path.startsWith("/products/") ? 0.8 : 0.7,
    url: absoluteUrl(path || "/")
  };
}
