"use client";

import { useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Eye, FileText, Globe, ImageIcon, LayoutTemplate, Megaphone, Save, Send } from "lucide-react";
import { websiteStudioData } from "@/mock/cms";
import type { CmsPublishStatus, HomepageSection, HomepageSectionType, WebsiteStudioData } from "@/types/cms";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import { readWebsiteStudioDraft, writeWebsiteStudioDraft } from "@/lib/cms/cmsLocalStorage";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { HomepageSectionRenderer } from "@/components/cms/HomepageSectionRenderer";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";

const tabs = [
  "Homepage",
  "Header",
  "Footer",
  "Banners",
  "Landing Pages",
  "Blog",
  "Policies",
  "Popups",
  "SEO",
  "Versions"
] as const;

type StudioTab = (typeof tabs)[number];

const sectionTypes: HomepageSectionType[] = [
  "hero_banner",
  "image_banner",
  "category_grid",
  "brand_carousel",
  "product_carousel",
  "collection_carousel",
  "goal_cards",
  "flash_sale",
  "trust_badges",
  "testimonials",
  "blog_preview",
  "newsletter",
  "video_section",
  "custom_html"
];

const statuses: CmsPublishStatus[] = ["draft", "scheduled", "published", "unpublished"];

export function WebsiteStudioClient() {
  const { session } = useAdminSession();
  const [activeTab, setActiveTab] = useState<StudioTab>("Homepage");
  const [studioData, setStudioData] = useState<WebsiteStudioData>(() => readWebsiteStudioDraft() ?? websiteStudioData);
  const [selectedSectionId, setSelectedSectionId] = useState(studioData.homepageSections[0]?.id ?? "");
  const [previewMode, setPreviewMode] = useState(false);
  const [toast, setToast] = useState("");
  const selectedSection = studioData.homepageSections.find((section) => section.id === selectedSectionId) ?? studioData.homepageSections[0];

  const publishedSections = useMemo(
    () =>
      studioData.homepageSections
        .filter((section) => section.enabled && (previewMode || section.status === "published"))
        .sort((first, second) => first.order - second.order),
    [previewMode, studioData.homepageSections]
  );

  function commit(nextData: WebsiteStudioData, action: string, message: string) {
    const versionAction = action.includes("publish") ? ("published" as const) : ("draft_saved" as const);
    const withVersion: WebsiteStudioData = {
      ...nextData,
      versionHistory: [
        {
          action: versionAction,
          at: new Date().toISOString(),
          editedBy: session?.fullName ?? "Mock admin",
          entityId: selectedSection?.id ?? "website-studio",
          id: `ver-${Date.now()}`,
          note: message
        },
        ...nextData.versionHistory
      ].slice(0, 12)
    };

    setStudioData(withVersion);
    writeWebsiteStudioDraft(withVersion);
    writeAdminAuditLog(session, {
      action,
      entityId: selectedSection?.id,
      entityType: "cms",
      metadata: { activeTab, message }
    });
    setToast(message);
  }

  function updateSection(sectionId: string, patch: Partial<HomepageSection>) {
    setStudioData((current) => ({
      ...current,
      homepageSections: current.homepageSections.map((section) =>
        section.id === sectionId ? { ...section, ...patch } : section
      )
    }));
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    const ordered = [...studioData.homepageSections].sort((first, second) => first.order - second.order);
    const index = ordered.findIndex((section) => section.id === sectionId);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;

    const currentOrder = ordered[index].order;
    ordered[index].order = ordered[nextIndex].order;
    ordered[nextIndex].order = currentOrder;

    setStudioData((current) => ({
      ...current,
      homepageSections: current.homepageSections.map((section) => ordered.find((entry) => entry.id === section.id) ?? section)
    }));
  }

  function saveDraft() {
    const invalidSection = studioData.homepageSections.find((section) => !section.title.trim());

    if (invalidSection) {
      setToast(`Validation failed: ${invalidSection.id} needs a title.`);
      return;
    }

    commit(studioData, "cms.save_draft", "Website Studio draft saved.");
  }

  function publish() {
    const nextData = {
      ...studioData,
      homepageSections: studioData.homepageSections.map((section) =>
        section.enabled ? { ...section, status: "published" as const } : section
      )
    };

    commit(nextData, "cms.publish", "Published homepage CMS sections to local storefront preview.");
  }

  return (
    <div className="space-y-6">
      {toast ? <div className="rounded-md bg-mint px-4 py-3 text-sm font-semibold text-forest">{toast}</div> : null}

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            className={`rounded-md px-4 py-2 text-sm font-black ${activeTab === tab ? "bg-ink text-white" : "bg-white text-ink"}`}
            key={tab}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="min-w-0 space-y-6">
          {activeTab === "Homepage" ? (
            <HomepageBuilder
              moveSection={moveSection}
              selectedSection={selectedSection}
              selectedSectionId={selectedSectionId}
              sections={studioData.homepageSections}
              setSelectedSectionId={setSelectedSectionId}
              updateSection={updateSection}
            />
          ) : null}
          {activeTab === "Header" ? <HeaderBuilder data={studioData} setData={setStudioData} /> : null}
          {activeTab === "Footer" ? <FooterBuilder data={studioData} setData={setStudioData} /> : null}
          {activeTab === "Banners" ? <BannerManager data={studioData} setData={setStudioData} /> : null}
          {activeTab === "Landing Pages" ? <LandingPageBuilder data={studioData} /> : null}
          {activeTab === "Blog" ? <BlogManager data={studioData} /> : null}
          {activeTab === "Policies" ? <PolicyManager data={studioData} /> : null}
          {activeTab === "Popups" ? <PopupBuilder data={studioData} setData={setStudioData} /> : null}
          {activeTab === "SEO" ? <SeoManager data={studioData} setData={setStudioData} /> : null}
          {activeTab === "Versions" ? <VersionHistory data={studioData} /> : null}
        </div>

        <aside className="min-w-0 space-y-6">
          <AdminCard title="Publishing workflow">
            <div className="grid gap-3">
              <button className="admin-action justify-center" onClick={saveDraft} type="button">
                <Save className="h-4 w-4" /> Save draft
              </button>
              <button className="admin-action justify-center" onClick={publish} type="button">
                <Send className="h-4 w-4" /> Publish
              </button>
              <button className="admin-action justify-center" onClick={() => setPreviewMode((value) => !value)} type="button">
                <Eye className="h-4 w-4" /> {previewMode ? "Exit preview" : "Preview mode"}
              </button>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate">
              Save/publish writes to the mock Website Studio store in localStorage. The homepage reads this data and falls back to seeded CMS content.
            </p>
          </AdminCard>

          <AdminCard title="Homepage preview">
            <div className="max-h-[720px] overflow-y-auto rounded-md border border-black/10 bg-mist">
              <div className="origin-top scale-[0.78]">
                <HomepageSectionRenderer preview sections={publishedSections.slice(0, 4)} />
              </div>
            </div>
          </AdminCard>
        </aside>
      </div>
    </div>
  );
}

function HomepageBuilder({
  moveSection,
  selectedSection,
  selectedSectionId,
  sections,
  setSelectedSectionId,
  updateSection
}: {
  moveSection: (sectionId: string, direction: -1 | 1) => void;
  selectedSection?: HomepageSection;
  selectedSectionId: string;
  sections: HomepageSection[];
  setSelectedSectionId: (sectionId: string) => void;
  updateSection: (sectionId: string, patch: Partial<HomepageSection>) => void;
}) {
  if (!selectedSection) return null;

  return (
    <>
      <AdminCard title="Homepage builder">
        <AdminTable
          columns={["Drag", "Section", "Type", "Status", "Visible", "Actions"]}
          rows={[...sections]
            .sort((first, second) => first.order - second.order)
            .map((section) => [
              <span className="cursor-grab text-lg font-black text-slate" key="drag">::</span>,
              <button className="text-left font-black text-ink" key="section" onClick={() => setSelectedSectionId(section.id)} type="button">
                {section.title}
              </button>,
              label(section.type),
              <Badge key="status" tone={section.status === "published" ? "success" : "neutral"}>{label(section.status)}</Badge>,
              <Badge key="visible" tone={section.enabled ? "success" : "sale"}>{section.enabled ? "Enabled" : "Disabled"}</Badge>,
              <div className="flex flex-wrap gap-2" key="actions">
                <button className="admin-action" onClick={() => moveSection(section.id, -1)} type="button"><ArrowUp className="h-4 w-4" /></button>
                <button className="admin-action" onClick={() => moveSection(section.id, 1)} type="button"><ArrowDown className="h-4 w-4" /></button>
                <button className="admin-action" onClick={() => updateSection(section.id, { enabled: !section.enabled })} type="button">
                  {section.enabled ? "Disable" : "Enable"}
                </button>
              </div>
            ])}
        />
      </AdminCard>

      <AdminCard title="Edit selected section">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Section title" onChange={(event) => updateSection(selectedSectionId, { title: event.target.value })} value={selectedSection.title} />
          <Input label="Section subtitle" onChange={(event) => updateSection(selectedSectionId, { subtitle: event.target.value })} value={selectedSection.subtitle ?? ""} />
          <Select label="Section type" onChange={(event) => updateSection(selectedSectionId, { type: event.target.value as HomepageSectionType })} value={selectedSection.type}>
            {sectionTypes.map((type) => <option key={type} value={type}>{label(type)}</option>)}
          </Select>
          <Select label="Publish status" onChange={(event) => updateSection(selectedSectionId, { status: event.target.value as CmsPublishStatus })} value={selectedSection.status}>
            {statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
          </Select>
          <Input label="Desktop banner image" onChange={(event) => updateSection(selectedSectionId, { desktopImageUrl: event.target.value })} placeholder="https://..." value={selectedSection.desktopImageUrl ?? ""} />
          <Input label="Mobile banner image" onChange={(event) => updateSection(selectedSectionId, { mobileImageUrl: event.target.value })} placeholder="https://..." value={selectedSection.mobileImageUrl ?? ""} />
          <Input label="CTA button text" onChange={(event) => updateSection(selectedSectionId, { ctaLabel: event.target.value })} value={selectedSection.ctaLabel ?? ""} />
          <Input label="CTA link" onChange={(event) => updateSection(selectedSectionId, { ctaLink: event.target.value })} value={selectedSection.ctaLink ?? ""} />
          <Select label="Background style" onChange={(event) => updateSection(selectedSectionId, { backgroundStyle: event.target.value as HomepageSection["backgroundStyle"] })} value={selectedSection.backgroundStyle}>
            {["white", "mist", "ink", "mint", "image"].map((style) => <option key={style} value={style}>{label(style)}</option>)}
          </Select>
          <Input label="Schedule publish date" onChange={(event) => updateSection(selectedSectionId, { publishAt: event.target.value })} type="datetime-local" value={selectedSection.publishAt ?? ""} />
        </div>
        <div className="mt-4 rounded-md bg-mist p-4">
          <p className="text-sm font-black text-ink">Selected carousel references</p>
          <p className="mt-2 text-sm text-slate">
            {selectedSection.references.map((reference) => reference.label).join(", ") || "No products/categories/brands selected yet."}
          </p>
        </div>
      </AdminCard>
    </>
  );
}

function HeaderBuilder({ data, setData }: { data: WebsiteStudioData; setData: (data: WebsiteStudioData) => void }) {
  return (
    <AdminCard title="Header and menu builder">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Logo text" onChange={(event) => setData({ ...data, header: { ...data.header, logoText: event.target.value } })} value={data.header.logoText} />
        <Input label="Logo upload placeholder" onChange={(event) => setData({ ...data, header: { ...data.header, logoUrl: event.target.value } })} placeholder="Image URL" value={data.header.logoUrl ?? ""} />
        <Input label="Announcement bar text" onChange={(event) => setData({ ...data, header: { ...data.header, announcementText: event.target.value } })} value={data.header.announcementText} />
        <Input label="Announcement bar link" onChange={(event) => setData({ ...data, header: { ...data.header, announcementUrl: event.target.value } })} value={data.header.announcementUrl ?? ""} />
      </div>
      <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {(["enableSearch", "enableAccount", "enableWishlist", "enableCart"] as const).map((key) => (
          <label className="flex items-center gap-2 rounded-md border border-black/10 p-3 text-sm font-bold text-ink" key={key}>
            <input checked={data.header[key]} onChange={(event) => setData({ ...data, header: { ...data.header, [key]: event.target.checked } })} type="checkbox" />
            {label(key.replace("enable", ""))}
          </label>
        ))}
      </div>
      <AdminTable
        columns={["Mega menu item", "Link type", "URL", "Nested items", "Status"]}
        rows={data.header.megaMenuItems.map((item) => [
          item.label,
          label(item.linkType),
          item.url,
          item.children?.map((child) => child.label).join(", ") ?? "None",
          <Badge key="status" tone={item.enabled ? "success" : "neutral"}>{item.enabled ? "Enabled" : "Disabled"}</Badge>
        ])}
      />
    </AdminCard>
  );
}

function FooterBuilder({ data, setData }: { data: WebsiteStudioData; setData: (data: WebsiteStudioData) => void }) {
  return (
    <AdminCard title="Footer builder">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Contact phone" onChange={(event) => setData({ ...data, footer: { ...data.footer, contactPhone: event.target.value } })} value={data.footer.contactPhone} />
        <Input label="Contact email" onChange={(event) => setData({ ...data, footer: { ...data.footer, contactEmail: event.target.value } })} value={data.footer.contactEmail} />
        <Input label="Newsletter text" onChange={(event) => setData({ ...data, footer: { ...data.footer, newsletterText: event.target.value } })} value={data.footer.newsletterText} />
        <Input label="Copyright text" onChange={(event) => setData({ ...data, footer: { ...data.footer, copyrightText: event.target.value } })} value={data.footer.copyrightText} />
      </div>
      <AdminTable
        columns={["Column", "Links", "Status"]}
        rows={data.footer.footerColumns.map((column) => [
          column.title,
          column.links.map((link) => link.label).join(", "),
          <Badge key="status" tone={column.enabled ? "success" : "neutral"}>{column.enabled ? "Enabled" : "Disabled"}</Badge>
        ])}
      />
      <p className="mt-4 text-sm text-slate">Payment icons placeholder: {data.footer.paymentIcons.join(", ")}</p>
    </AdminCard>
  );
}

function BannerManager({ data, setData }: { data: WebsiteStudioData; setData: (data: WebsiteStudioData) => void }) {
  return (
    <AdminCard title="Banner manager">
      <AdminTable
        columns={["Banner", "Target", "Dates", "CTA", "Status"]}
        rows={data.banners.map((banner) => [
          <span className="inline-flex items-center gap-2 font-black text-ink" key="banner"><ImageIcon className="h-4 w-4" /> {banner.title}</span>,
          label(banner.targetPage),
          `${banner.startDate ?? "Now"} to ${banner.endDate ?? "Open"}`,
          `${banner.ctaLabel} -> ${banner.ctaLink}`,
          <button
            className="admin-action"
            key="status"
            onClick={() =>
              setData({
                ...data,
                banners: data.banners.map((entry) => entry.id === banner.id ? { ...entry, active: !entry.active } : entry)
              })
            }
            type="button"
          >
            {banner.active ? "Active" : "Inactive"}
          </button>
        ])}
      />
    </AdminCard>
  );
}

function LandingPageBuilder({ data }: { data: WebsiteStudioData }) {
  return (
    <AdminCard title="Landing page builder">
      <AdminTable
        columns={["Page", "Slug", "SEO", "Status"]}
        rows={data.landingPages.map((page) => [
          <span className="inline-flex items-center gap-2 font-black text-ink" key="page"><LayoutTemplate className="h-4 w-4" /> {page.title}</span>,
          page.slug,
          page.seoTitle,
          <Badge key="status" tone={page.status === "published" ? "success" : "neutral"}>{label(page.status)}</Badge>
        ])}
      />
    </AdminCard>
  );
}

function BlogManager({ data }: { data: WebsiteStudioData }) {
  return (
    <AdminCard title="Blog CMS">
      <AdminTable
        columns={["Post", "Author", "Category", "SEO", "Disclaimer", "Status"]}
        rows={data.blogPosts.map((post) => [
          <span className="inline-flex items-center gap-2 font-black text-ink" key="post"><FileText className="h-4 w-4" /> {post.title}</span>,
          post.author,
          post.category,
          post.seoTitle,
          post.disclaimerEnabled ? "Enabled" : "Disabled",
          <Badge key="status" tone={post.status === "published" ? "success" : "neutral"}>{label(post.status)}</Badge>
        ])}
      />
    </AdminCard>
  );
}

function PolicyManager({ data }: { data: WebsiteStudioData }) {
  return (
    <AdminCard title="Policy pages">
      <AdminTable
        columns={["Policy", "Slug", "SEO description", "Status"]}
        rows={data.policies.map((page) => [
          page.title,
          `/pages/${page.slug}`,
          page.seoDescription,
          <Badge key="status" tone={page.status === "published" ? "success" : "neutral"}>{label(page.status)}</Badge>
        ])}
      />
    </AdminCard>
  );
}

function PopupBuilder({ data, setData }: { data: WebsiteStudioData; setData: (data: WebsiteStudioData) => void }) {
  return (
    <AdminCard title="Popup builder">
      <AdminTable
        columns={["Popup", "Type", "Rules", "Status"]}
        rows={data.popups.map((popup) => [
          <span className="inline-flex items-center gap-2 font-black text-ink" key="popup"><Megaphone className="h-4 w-4" /> {popup.title}</span>,
          label(popup.type),
          popup.displayRules.join(", "),
          <button
            className="admin-action"
            key="status"
            onClick={() =>
              setData({
                ...data,
                popups: data.popups.map((entry) => entry.id === popup.id ? { ...entry, active: !entry.active } : entry)
              })
            }
            type="button"
          >
            {popup.active ? "Active" : "Inactive"}
          </button>
        ])}
      />
    </AdminCard>
  );
}

function SeoManager({ data, setData }: { data: WebsiteStudioData; setData: (data: WebsiteStudioData) => void }) {
  const homeSeo = data.seo[0];

  return (
    <AdminCard title="SEO manager">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Page title" onChange={(event) => setData({ ...data, seo: [{ ...homeSeo, title: event.target.value }, ...data.seo.slice(1)] })} value={homeSeo.title} />
        <Input label="Meta description" onChange={(event) => setData({ ...data, seo: [{ ...homeSeo, metaDescription: event.target.value }, ...data.seo.slice(1)] })} value={homeSeo.metaDescription} />
        <Input label="Canonical URL placeholder" onChange={(event) => setData({ ...data, seo: [{ ...homeSeo, canonicalUrl: event.target.value }, ...data.seo.slice(1)] })} value={homeSeo.canonicalUrl ?? ""} />
        <Input label="Open Graph image" onChange={(event) => setData({ ...data, seo: [{ ...homeSeo, ogImageUrl: event.target.value }, ...data.seo.slice(1)] })} value={homeSeo.ogImageUrl ?? ""} />
      </div>
      <label className="mt-4 flex items-center gap-2 rounded-md border border-black/10 p-3 text-sm font-bold text-ink">
        <input checked={homeSeo.noindex} onChange={(event) => setData({ ...data, seo: [{ ...homeSeo, noindex: event.target.checked }, ...data.seo.slice(1)] })} type="checkbox" />
        Noindex this page
      </label>
      <p className="mt-4 text-sm text-slate">Structured data placeholder: {homeSeo.structuredDataPlaceholder}</p>
    </AdminCard>
  );
}

function VersionHistory({ data }: { data: WebsiteStudioData }) {
  return (
    <AdminCard title="Version history">
      <AdminTable
        columns={["Action", "Entity", "Edited by", "Date", "Note"]}
        rows={data.versionHistory.map((version) => [
          label(version.action),
          version.entityId,
          version.editedBy,
          new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(version.at)),
          version.note
        ])}
      />
      <button className="admin-action mt-4" type="button"><Globe className="h-4 w-4" /> Rollback placeholder</button>
    </AdminCard>
  );
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
