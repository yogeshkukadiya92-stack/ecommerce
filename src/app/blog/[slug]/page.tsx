import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedBlogPost, getPublishedBlogPosts } from "@/lib/cms/cmsRepository";
import { absoluteUrl, breadcrumbSchema, buildSeoMetadata } from "@/lib/seo/seo";

export function generateStaticParams() {
  return getPublishedBlogPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = getPublishedBlogPost(slug);

  return buildSeoMetadata({
    canonicalPath: `/blog/${slug}`,
    description: post?.seoDescription ?? "FitSupplement Store guide.",
    image: post?.featuredImageUrl,
    title: post?.seoTitle ?? post?.title ?? "Fitness guide"
  });
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = getPublishedBlogPost(slug);

  if (!post) notFound();

  return (
    <SiteShell>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          author: post.author,
          datePublished: post.publishedAt,
          description: post.seoDescription,
          headline: post.title,
          image: post.featuredImageUrl ? absoluteUrl(post.featuredImageUrl) : undefined,
          url: absoluteUrl(`/blog/${post.slug}`)
        }}
      />
      <JsonLd
        data={breadcrumbSchema([
          { href: "/", label: "Home" },
          { href: "/blog", label: "Fitness guides" },
          { href: `/blog/${post.slug}`, label: post.title }
        ])}
      />
      <main className="container-page py-12">
        <article className="mx-auto max-w-3xl rounded-card border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">{post.category}</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ink">{post.title}</h1>
          <p className="mt-3 text-sm font-semibold text-slate">By {post.author}</p>
          <div className="mt-8 text-base leading-8 text-graphite">{post.content}</div>
          {post.disclaimerEnabled ? (
            <div className="mt-8 rounded-md bg-mist p-4 text-sm leading-6 text-slate">
              This content is for general supplement shopping education only and is not medical advice. This product category is not intended to diagnose, treat, cure, or prevent any disease.
            </div>
          ) : null}
        </article>
      </main>
    </SiteShell>
  );
}
