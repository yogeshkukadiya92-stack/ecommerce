import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/SiteShell";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublishedPolicyPage, getPublishedPolicyPages } from "@/lib/cms/cmsRepository";
import { breadcrumbSchema, buildSeoMetadata } from "@/lib/seo/seo";

export function generateStaticParams() {
  return getPublishedPolicyPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = getPublishedPolicyPage(slug);

  return buildSeoMetadata({
    canonicalPath: `/pages/${slug}`,
    description: page?.seoDescription ?? "FitSupplement Store policy page.",
    title: page?.seoTitle ?? page?.title ?? "Policy"
  });
}

export default async function PolicyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = getPublishedPolicyPage(slug);

  if (!page) notFound();

  return (
    <SiteShell>
      <JsonLd
        data={breadcrumbSchema([
          { href: "/", label: "Home" },
          { href: `/pages/${page.slug}`, label: page.title }
        ])}
      />
      <main className="container-page py-12">
        <article className="mx-auto max-w-3xl rounded-card border border-black/10 bg-white p-6 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">Policy page</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-ink">{page.title}</h1>
          <div className="mt-8 text-base leading-8 text-graphite">{page.content}</div>
        </article>
      </main>
    </SiteShell>
  );
}
