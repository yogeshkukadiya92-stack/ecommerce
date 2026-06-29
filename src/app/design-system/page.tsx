import { SiteShell } from "@/components/layout/SiteShell";
import { BrandCard } from "@/components/storefront/BrandCard";
import { CategoryCard } from "@/components/storefront/CategoryCard";
import { ProductCard } from "@/components/storefront/ProductCard";
import { TrustBadge } from "@/components/storefront/TrustBadge";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { Tabs } from "@/components/ui/Tabs";
import { Accordion } from "@/components/ui/Accordion";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { ProductCardSkeleton } from "@/components/ui/Skeleton";
import { QuantitySelector } from "@/components/ui/QuantitySelector";
import { RatingStars } from "@/components/ui/RatingStars";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { AdminTable } from "@/components/admin/AdminTable";
import { AdminFormPreview } from "@/components/admin/AdminForm";
import { Award } from "lucide-react";
import { brands, categories, featuredProducts } from "@/mock";

export default function DesignSystemPage() {
  return (
    <SiteShell>
      <main className="container-page py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight text-ink">Design system</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate">
            Phase 1 component library for storefront, visual states, and admin shell primitives.
          </p>
        </div>

        <section className="grid gap-4 lg:grid-cols-3">
          <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-ink">Colors and buttons</h2>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {["bg-ink", "bg-forest", "bg-lime", "bg-mist", "bg-coral"].map((color) => (
                <div key={color} className={`${color} h-12 rounded-md border border-black/10`} />
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Button href="/design-system" variant="dark">Dark</Button>
              <Button href="/design-system">Primary</Button>
              <Button href="/design-system" variant="secondary">Secondary</Button>
              <Button href="/design-system" variant="ghost">Ghost</Button>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge tone="success">Verified</Badge>
              <Badge tone="sale">Sale</Badge>
              <Badge tone="dark">Premium</Badge>
            </div>
          </div>

          <div className="rounded-card border border-black/10 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-ink">Inputs and controls</h2>
            <div className="mt-4 grid gap-4">
              <Input helperText="Used for account, checkout, and admin forms." label="Email" placeholder="you@example.com" />
              <Select label="Goal">
                <option>Muscle support</option>
                <option>Strength</option>
                <option>Daily wellness</option>
              </Select>
              <QuantitySelector />
              <RatingStars rating={4.8} reviewCount={128} />
            </div>
          </div>

          <Modal title="Modal preview">
            <p className="text-sm leading-6 text-slate">
              Modal shell for confirmation, coupon details, quick view, or admin workflows.
            </p>
          </Modal>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <SectionTitle title="Commerce cards" />
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <ProductCard product={featuredProducts[0]} />
              <CategoryCard category={categories[0]} />
              <BrandCard brand={brands[0]} />
            </div>
          </div>
          <div>
            <SectionTitle title="Trust badge" />
            <TrustBadge
              description="Compact proof modules for authenticity, payments, shipping, and returns."
              icon={Award}
              title="Authentic products"
            />
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div>
            <SectionTitle title="Tabs and accordion" />
            <Tabs
              tabs={[
                { label: "Nutrition", content: "Protein, carbs, ingredients, allergens, and label assets." },
                { label: "Usage", content: "Usage instructions and supplement warning text." }
              ]}
            />
            <div className="mt-4">
              <Accordion
                items={[
                  {
                    title: "Is this medical advice?",
                    content: "No. The platform presents supplement information and avoids disease cure claims."
                  },
                  {
                    title: "Can admin control this?",
                    content: "Yes. CMS, product, inventory, and warning text are modeled for admin control."
                  }
                ]}
              />
            </div>
          </div>
          <div>
            <SectionTitle title="Visual states" />
            <div className="grid gap-4">
              <ProductCardSkeleton />
              <EmptyState title="No products found" description="Clear filters or try another search term." />
              <ErrorState title="Unable to load products" description="This is the reusable error-state pattern." />
            </div>
          </div>
        </section>

        <section className="mt-10">
          <SectionTitle title="Admin components" />
          <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
            <AdminTable
              columns={["SKU", "Batch", "Stock", "Status"]}
              rows={[
                ["NF-WHEY-CHOCO-1KG", "WF-A1-1127", "88 available", "Healthy"],
                ["NF-CRTN-UNFL-250G", "NF-D1-0128", "9 available", "Low stock"]
              ]}
            />
            <AdminFormPreview />
          </div>
        </section>
      </main>
    </SiteShell>
  );
}
