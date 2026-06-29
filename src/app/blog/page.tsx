import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/SiteShell";
import { getPublishedBlogPosts } from "@/lib/cms/cmsRepository";
import { buildSeoMetadata } from "@/lib/seo/seo";

export const metadata: Metadata = buildSeoMetadata({
  canonicalPath: "/blog",
  description: "Supplement-safe shopping guides from FitSupplement Store.",
  title: "Fitness Guides"
});

export default function BlogIndexPage() {
  const posts = getPublishedBlogPosts();

  return (
    <SiteShell>
      <main className="container-page py-12">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">CMS blog</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-ink">Fitness guides</h1>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {posts.map((post) => (
            <article className="rounded-card border border-black/10 bg-white p-6 shadow-sm" key={post.id}>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">{post.category}</p>
              <h2 className="mt-3 text-2xl font-black text-ink">{post.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate">{post.seoDescription}</p>
              <Link className="mt-5 inline-flex text-sm font-black text-forest" href={`/blog/${post.slug}`}>
                Read article
              </Link>
            </article>
          ))}
        </div>
      </main>
    </SiteShell>
  );
}
