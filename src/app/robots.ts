import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/seo/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    host: siteUrl,
    rules: [
      {
        allow: ["/", "/products", "/categories", "/brands", "/collections", "/blog", "/pages"],
        disallow: ["/admin", "/checkout", "/account"],
        userAgent: "*"
      }
    ],
    sitemap: `${siteUrl}/sitemap.xml`
  };
}
