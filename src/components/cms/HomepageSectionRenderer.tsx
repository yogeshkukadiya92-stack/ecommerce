import { Award, CreditCard, Play, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { HomepageSection } from "@/types/cms";
import { cn } from "@/lib/utils/cn";
import { brands, categories, featuredProducts, goalCards, testimonials } from "@/mock";
import { storefrontProducts, type StorefrontProduct } from "@/mock/storefront";
import { bundleDeals } from "@/mock/promotions";
import { getPublishedBlogPosts } from "@/lib/cms/cmsRepository";
import { BrandCard } from "@/components/storefront/BrandCard";
import { CategoryCard } from "@/components/storefront/CategoryCard";
import { NewsletterBox } from "@/components/storefront/NewsletterBox";
import { ProductCarousel } from "@/components/storefront/ProductCarousel";
import { TrustBadge } from "@/components/storefront/TrustBadge";
import { Button } from "@/components/ui/Button";
import { SectionTitle } from "@/components/ui/SectionTitle";

export function HomepageSectionRenderer({
  preview = false,
  products,
  sections
}: {
  preview?: boolean;
  products?: StorefrontProduct[];
  sections: HomepageSection[];
}) {
  const displayProducts = products?.length ? products : storefrontProducts;

  return (
    <>
      {sections.map((section) => (
        <RenderedSection displayProducts={displayProducts} key={section.id} preview={preview} section={section} />
      ))}
    </>
  );
}

function RenderedSection({
  displayProducts,
  preview,
  section
}: {
  displayProducts: StorefrontProduct[];
  preview: boolean;
  section: HomepageSection;
}) {
  if (!section.enabled && !preview) return null;

  const alignment = section.contentAlignment ?? "left";
  const align = getAlignmentClasses(alignment);

  const previewBadge = preview ? (
    <div className="container-page pt-3">
      <span className="inline-flex rounded-md bg-ink px-2 py-1 text-xs font-black text-white">
        Preview: {section.status}
      </span>
    </div>
  ) : null;

  switch (section.type) {
    case "hero_banner":
      return (
        <section className={sectionShell(section.backgroundStyle)}>
          {previewBadge}
          <div className="container-page grid items-center gap-10 py-10 lg:grid-cols-[1.02fr_0.98fr] lg:py-14">
            <div className={cn("max-w-2xl", align.text, align.block)}>
              <h1 className="text-4xl font-extrabold tracking-tight text-ink sm:text-5xl lg:text-6xl lg:leading-[1.02]">{section.title}</h1>
              <p className={cn("mt-5 max-w-xl text-base leading-7 text-slate sm:text-lg", align.block)}>{section.subtitle}</p>
              <div className={cn("mt-7 flex flex-col gap-3 sm:flex-row", align.flex)}>
                <Button href={section.ctaLink ?? "/products"} size="lg" variant="dark">
                  {section.ctaLabel ?? "Shop now"}
                </Button>
                <Button href="/collections/best-sellers" size="lg" variant="secondary">
                  Shop best sellers
                </Button>
              </div>
              <div className={cn("mt-7 flex flex-wrap gap-2 text-xs font-extrabold text-forest", align.flex)}>
                {["Verified supply", "Secure checkout", "Expiry-visible batches"].map((item) => (
                  <span className="rounded-md border border-black/10 bg-white px-3 py-2 shadow-sm" key={item}>{item}</span>
                ))}
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {["Average rating", "Dispatch target", "Batch tracked"].map((metric, index) => (
                  <div className="rounded-card border border-black/10 bg-white/90 p-4 shadow-sm" key={metric}>
                    <p className="text-2xl font-extrabold tracking-tight text-ink">{["4.8", "24h", "100%"][index]}</p>
                    <p className="text-xs font-semibold text-slate">{metric}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="overflow-hidden rounded-card border border-black/10 bg-white p-3 shadow-soft">
              <Image
                alt={section.title}
                className="aspect-[4/3] w-full rounded-md object-cover"
                height={640}
                priority
                src={section.desktopImageUrl ?? displayProducts[0]?.images[0]?.url ?? featuredProducts[0].images[0]?.url}
                width={840}
              />
              <div className="grid gap-2 px-1 pb-1 pt-3 sm:grid-cols-3">
                {["Whey", "Creatine", "Wellness"].map((item) => (
                  <Link className="rounded-md bg-mist px-3 py-2 text-center text-xs font-black text-ink hover:bg-mint" href="/products" key={item}>
                    {item}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    case "image_banner":
    case "flash_sale":
      return (
        <section className="container-page py-8">
          <div className="grid gap-6 rounded-card bg-ink p-6 text-white shadow-card lg:grid-cols-[1fr_320px] lg:items-center">
            <div className={align.text}>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-lime">{section.type === "flash_sale" ? "Flash sale" : "Banner"}</p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">{section.title}</h2>
              <p className={cn("mt-3 max-w-2xl text-sm leading-6 text-white/70", align.block)}>{section.subtitle}</p>
              {section.type === "flash_sale" ? (
                <div className={cn("mt-5 inline-grid grid-cols-4 gap-2 text-center text-xs font-black", align.inlineBlock)}>
                  {["02 days", "11 hrs", "42 min", "09 sec"].map((part) => (
                    <span className="rounded-md bg-white/10 px-3 py-2" key={part}>{part}</span>
                  ))}
                </div>
              ) : null}
            </div>
            <div className={align.justifySelf}>
              <Button href={section.ctaLink ?? "/products"} variant="primary">
                {section.ctaLabel ?? "Shop now"}
              </Button>
            </div>
          </div>
          {section.type === "flash_sale" ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {bundleDeals.slice(0, 2).map((bundle) => (
                <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm" key={bundle.id}>
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">Bundle deal</p>
                  <h3 className="mt-2 text-xl font-black text-ink">{bundle.title}</h3>
                  <p className="mt-2 text-sm text-slate">{bundle.description}</p>
                  <p className="mt-3 text-sm font-black text-forest">
                    Rs {bundle.bundlePrice.toLocaleString("en-IN")} - save Rs {bundle.discountAmount.toLocaleString("en-IN")}
                  </p>
                  <Link className="mt-4 inline-flex text-sm font-black text-ink" href="/cart">Add full bundle in cart</Link>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      );
    case "category_grid":
      return (
        <section className="container-page py-8">
          <SectionTitle alignment={alignment} description={section.subtitle} title={section.title} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </section>
      );
    case "brand_carousel":
      return (
        <section className="container-page pb-14 pt-8">
          <SectionTitle alignment={alignment} description={section.subtitle} title={section.title} />
          <div className="grid gap-4 md:grid-cols-3">
            {brands.map((brand) => (
              <BrandCard key={brand.id} brand={brand} />
            ))}
          </div>
        </section>
      );
    case "product_carousel":
    case "collection_carousel": {
      return (
        <section className="container-page py-8">
          <SectionTitle
            action={
              section.ctaLink ? (
                <Button href={section.ctaLink} variant="secondary">
                  {section.ctaLabel ?? "View all"}
                </Button>
              ) : undefined
            }
            alignment={alignment}
            description={section.subtitle}
            title={section.title}
          />
          <ProductCarousel products={displayProducts} />
        </section>
      );
    }
    case "goal_cards":
      return (
        <section className="container-page py-8">
          <SectionTitle alignment={alignment} description={section.subtitle} title={section.title} />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {goalCards.map((goal) => (
              <Link
                className="group rounded-card border border-black/10 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-card"
                href={goal.href}
                key={goal.slug}
              >
                <span className="text-xs font-black uppercase tracking-[0.14em] text-forest">Goal</span>
                <h3 className="mt-3 text-xl font-black text-ink">{goal.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate">{goal.description}</p>
              </Link>
            ))}
          </div>
        </section>
      );
    case "trust_badges":
      return (
        <section className="container-page py-8">
          <SectionTitle alignment={alignment} description={section.subtitle} title={section.title} />
          <div className="grid gap-3 md:grid-cols-4">
            <TrustBadge description="Every supplement is sourced for transparent, label-first shopping." icon={Award} title="Authentic products" />
            <TrustBadge description="Encrypted checkout with secure online payment options." icon={CreditCard} title="Secure payments" />
            <TrustBadge description="Pincode-aware delivery with courier tracking." icon={Truck} title="Fast delivery" />
            <TrustBadge description="Clear order support for returns, refunds, and replacements." icon={RotateCcw} title="Easy returns" />
          </div>
        </section>
      );
    case "testimonials":
      return (
        <section className="container-page py-8">
          <SectionTitle alignment={alignment} description={section.subtitle} title={section.title} />
          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <figure className="rounded-card border border-black/10 bg-white p-5 shadow-sm" key={testimonial.name}>
                <blockquote className="text-sm leading-6 text-graphite">{testimonial.quote}</blockquote>
                <figcaption className="mt-4">
                  <p className="font-black text-ink">{testimonial.name}</p>
                  <p className="text-xs font-semibold text-slate">{testimonial.title}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      );
    case "blog_preview":
      return (
        <section className="container-page py-8">
          <SectionTitle alignment={alignment} description={section.subtitle} title={section.title} />
          <div className="grid gap-4 md:grid-cols-3">
            {getPublishedBlogPosts().map((post) => (
              <article className="rounded-card border border-black/10 bg-white p-5 shadow-sm" key={post.slug}>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-forest">{post.category}</p>
                <h3 className="mt-3 text-lg font-black leading-6 text-ink">{post.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate">{post.seoDescription}</p>
                <Link className="mt-4 inline-flex text-sm font-black text-forest" href={`/blog/${post.slug}`}>
                  Read guide
                </Link>
              </article>
            ))}
          </div>
        </section>
      );
    case "newsletter":
      return (
        <section className="container-page pb-14 pt-8">
          <div className="rounded-card border border-black/10 bg-white p-6 shadow-sm">
            <SectionTitle alignment={alignment} description={section.subtitle} title={section.title} />
            <NewsletterBox />
          </div>
        </section>
      );
    case "video_section":
      return (
        <section className="container-page py-8">
          <div className="grid gap-6 rounded-card bg-white p-6 shadow-sm lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <SectionTitle alignment={alignment} description={section.subtitle} title={section.title} />
              <p className={cn("text-sm text-slate", align.text)}>{section.videoUrl ? "Watch the latest product and fitness guide." : "Product education, usage tips, and label guidance in one place."}</p>
            </div>
            <div className="grid aspect-video place-items-center rounded-md bg-ink text-white">
              <Play className="h-10 w-10" />
            </div>
          </div>
        </section>
      );
    case "custom_html":
      return (
        <section className="container-page py-8">
          <div className={cn("rounded-card border border-dashed border-black/20 bg-white p-6", align.text)}>
            <ShieldCheck className={cn("h-6 w-6 text-forest", align.icon)} />
            <h2 className="mt-3 text-2xl font-black text-ink">{section.title}</h2>
            <p className="mt-2 text-sm text-slate">CMS-managed content block for campaign copy, product education, and trust messaging.</p>
          </div>
        </section>
      );
  }
}

function getAlignmentClasses(alignment: NonNullable<HomepageSection["contentAlignment"]>) {
  const classes = {
    center: {
      block: "mx-auto",
      flex: "justify-center",
      icon: "mx-auto",
      inlineBlock: "mx-auto",
      justifySelf: "justify-self-center",
      text: "text-center"
    },
    left: {
      block: "",
      flex: "justify-start",
      icon: "",
      inlineBlock: "",
      justifySelf: "justify-self-start",
      text: "text-left"
    },
    right: {
      block: "ml-auto",
      flex: "justify-end",
      icon: "ml-auto",
      inlineBlock: "ml-auto",
      justifySelf: "justify-self-end",
      text: "text-right"
    }
  } satisfies Record<
    NonNullable<HomepageSection["contentAlignment"]>,
    { block: string; flex: string; icon: string; inlineBlock: string; justifySelf: string; text: string }
  >;

  return classes[alignment];
}

function sectionShell(backgroundStyle: HomepageSection["backgroundStyle"]) {
  const styles: Record<HomepageSection["backgroundStyle"], string> = {
    image: "bg-white",
    ink: "bg-ink text-white",
    mint: "bg-mint",
    mist: "bg-mist",
    white: "bg-white"
  };

  return styles[backgroundStyle];
}
