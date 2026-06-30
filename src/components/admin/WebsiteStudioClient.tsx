"use client";

import { useMemo, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Eye,
  FileText,
  Globe,
  ImageIcon,
  LayoutTemplate,
  Megaphone,
  Save,
  Send
} from "lucide-react";
import { websiteStudioData } from "@/mock/cms";
import type { CmsPublishStatus, CmsSectionAlignment, HomepageSection, HomepageSectionType, WebsiteStudioData } from "@/types/cms";
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
  "Alignment",
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
const alignments: CmsSectionAlignment[] = ["left", "center", "right"];

export function WebsiteStudioClient({
  autoSaveChanges = false,
  initialTab = "Homepage",
  tabsLocked = false
}: {
  autoSaveChanges?: boolean;
  initialTab?: StudioTab;
  tabsLocked?: boolean;
} = {}) {
  const { session } = useAdminSession();
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab);
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
    setStudioData((current) => {
      const nextData = {
        ...current,
        homepageSections: current.homepageSections.map((section) =>
          section.id === sectionId ? { ...section, ...patch } : section
        )
      };

      if (autoSaveChanges) {
        writeWebsiteStudioDraft(nextData);
        setToast("Alignment draft saved.");
      }

      return nextData;
    });
  }

  function updateStudioData(nextData: WebsiteStudioData) {
    setStudioData(nextData);

    if (autoSaveChanges) {
      writeWebsiteStudioDraft(nextData);
      setToast("Website editor draft saved.");
    }
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

      {tabsLocked ? null : (
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
      )}

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
          {activeTab === "Alignment" ? (
            <AlignmentBuilder
              sections={studioData.homepageSections}
              selectedSectionId={selectedSectionId}
              setSelectedSectionId={setSelectedSectionId}
              updateSection={updateSection}
            />
          ) : null}
          {activeTab === "Header" ? <HeaderBuilder data={studioData} setData={updateStudioData} /> : null}
          {activeTab === "Footer" ? <FooterBuilder data={studioData} setData={updateStudioData} /> : null}
          {activeTab === "Banners" ? <BannerManager data={studioData} setData={updateStudioData} /> : null}
          {activeTab === "Landing Pages" ? <LandingPageBuilder data={studioData} setData={updateStudioData} /> : null}
          {activeTab === "Blog" ? <BlogManager data={studioData} setData={updateStudioData} /> : null}
          {activeTab === "Policies" ? <PolicyManager data={studioData} setData={updateStudioData} /> : null}
          {activeTab === "Popups" ? <PopupBuilder data={studioData} setData={updateStudioData} /> : null}
          {activeTab === "SEO" ? <SeoManager data={studioData} setData={updateStudioData} /> : null}
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
          <Select label="Content alignment" onChange={(event) => updateSection(selectedSectionId, { contentAlignment: event.target.value as CmsSectionAlignment })} value={selectedSection.contentAlignment ?? "left"}>
            {alignments.map((alignment) => <option key={alignment} value={alignment}>{label(alignment)}</option>)}
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

function AlignmentBuilder({
  sections,
  selectedSectionId,
  setSelectedSectionId,
  updateSection
}: {
  sections: HomepageSection[];
  selectedSectionId: string;
  setSelectedSectionId: (sectionId: string) => void;
  updateSection: (sectionId: string, patch: Partial<HomepageSection>) => void;
}) {
  const selectedSection = sections.find((section) => section.id === selectedSectionId) ?? sections[0];

  return (
    <AdminCard title="Alignment">
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
        <Select label="Homepage section" onChange={(event) => setSelectedSectionId(event.target.value)} value={selectedSection?.id ?? ""}>
          {[...sections]
            .sort((first, second) => first.order - second.order)
            .map((section) => (
              <option key={section.id} value={section.id}>{section.title}</option>
            ))}
        </Select>
        <Select
          label="Content alignment"
          onChange={(event) => selectedSection && updateSection(selectedSection.id, { contentAlignment: event.target.value as CmsSectionAlignment })}
          value={selectedSection?.contentAlignment ?? "left"}
        >
          {alignments.map((alignment) => <option key={alignment} value={alignment}>{label(alignment)}</option>)}
        </Select>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {alignments.map((alignment) => {
          const active = (selectedSection?.contentAlignment ?? "left") === alignment;
          const Icon = alignment === "left" ? AlignLeft : alignment === "center" ? AlignCenter : AlignRight;

          return (
            <button
              className={`flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-black ${
                active ? "border-forest bg-mint text-forest" : "border-black/10 bg-white text-ink"
              }`}
              key={alignment}
              onClick={() => selectedSection && updateSection(selectedSection.id, { contentAlignment: alignment })}
              type="button"
            >
              <Icon className="h-4 w-4" />
              {label(alignment)}
            </button>
          );
        })}
      </div>

      <AdminTable
        columns={["Section", "Alignment"]}
        rows={[...sections]
          .sort((first, second) => first.order - second.order)
          .map((section) => [
            <button className="text-left font-black text-ink" key="section" onClick={() => setSelectedSectionId(section.id)} type="button">
              {section.title}
            </button>,
            <Select
              key="alignment"
              onChange={(event) => updateSection(section.id, { contentAlignment: event.target.value as CmsSectionAlignment })}
              value={section.contentAlignment ?? "left"}
            >
              {alignments.map((alignment) => <option key={alignment} value={alignment}>{label(alignment)}</option>)}
            </Select>
          ])}
      />
    </AdminCard>
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
      <div className="grid gap-5">
        {data.banners.map((banner) => (
          <div className="rounded-md border border-black/10 p-4" key={banner.id}>
            <div className="mb-4 flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-2 font-black text-ink"><ImageIcon className="h-4 w-4" /> {banner.title}</span>
              <button
                className="admin-action"
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
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Banner title"
                onChange={(event) =>
                  setData({ ...data, banners: data.banners.map((entry) => entry.id === banner.id ? { ...entry, title: event.target.value } : entry) })
                }
                value={banner.title}
              />
              <Select
                label="Target page"
                onChange={(event) =>
                  setData({
                    ...data,
                    banners: data.banners.map((entry) =>
                      entry.id === banner.id ? { ...entry, targetPage: event.target.value as WebsiteStudioData["banners"][number]["targetPage"] } : entry
                    )
                  })
                }
                value={banner.targetPage}
              >
                {["homepage", "product_listing", "cart", "all"].map((target) => <option key={target} value={target}>{label(target)}</option>)}
              </Select>
              <Input
                label="Desktop image"
                onChange={(event) =>
                  setData({ ...data, banners: data.banners.map((entry) => entry.id === banner.id ? { ...entry, desktopImageUrl: event.target.value } : entry) })
                }
                value={banner.desktopImageUrl}
              />
              <Input
                label="Mobile image"
                onChange={(event) =>
                  setData({ ...data, banners: data.banners.map((entry) => entry.id === banner.id ? { ...entry, mobileImageUrl: event.target.value } : entry) })
                }
                value={banner.mobileImageUrl ?? ""}
              />
              <Input
                label="CTA text"
                onChange={(event) =>
                  setData({ ...data, banners: data.banners.map((entry) => entry.id === banner.id ? { ...entry, ctaLabel: event.target.value } : entry) })
                }
                value={banner.ctaLabel}
              />
              <Input
                label="CTA link"
                onChange={(event) =>
                  setData({ ...data, banners: data.banners.map((entry) => entry.id === banner.id ? { ...entry, ctaLink: event.target.value } : entry) })
                }
                value={banner.ctaLink}
              />
              <Input
                label="Start date"
                onChange={(event) =>
                  setData({ ...data, banners: data.banners.map((entry) => entry.id === banner.id ? { ...entry, startDate: event.target.value } : entry) })
                }
                type="date"
                value={banner.startDate ?? ""}
              />
              <Input
                label="End date"
                onChange={(event) =>
                  setData({ ...data, banners: data.banners.map((entry) => entry.id === banner.id ? { ...entry, endDate: event.target.value } : entry) })
                }
                type="date"
                value={banner.endDate ?? ""}
              />
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

function LandingPageBuilder({ data, setData }: { data: WebsiteStudioData; setData: (data: WebsiteStudioData) => void }) {
  function updateLandingPage(pageId: string, patch: Partial<WebsiteStudioData["landingPages"][number]>) {
    setData({
      ...data,
      landingPages: data.landingPages.map((entry) => entry.id === pageId ? { ...entry, ...patch } : entry)
    });
  }

  function updateLandingSection(
    pageId: string,
    sectionId: string,
    patch: Partial<WebsiteStudioData["landingPages"][number]["sections"][number]>
  ) {
    setData({
      ...data,
      landingPages: data.landingPages.map((entry) =>
        entry.id === pageId
          ? {
              ...entry,
              sections: entry.sections.map((section) => section.id === sectionId ? { ...section, ...patch } : section)
            }
          : entry
      )
    });
  }

  function addLandingSection(pageId: string) {
    setData({
      ...data,
      landingPages: data.landingPages.map((entry) =>
        entry.id === pageId
          ? {
              ...entry,
              sections: [
                ...entry.sections,
                {
                  backgroundStyle: "white",
                  contentAlignment: "left",
                  enabled: true,
                  id: `landing-section-${Date.now()}`,
                  order: entry.sections.length + 1,
                  references: [],
                  subtitle: "Edit this landing page content from admin.",
                  title: "New landing section",
                  type: "hero_banner"
                }
              ]
            }
          : entry
      )
    });
  }

  return (
    <AdminCard title="Landing page builder">
      <div className="grid gap-5">
        {data.landingPages.map((page) => (
          <div className="rounded-md border border-black/10 p-4" key={page.id}>
            <div className="mb-4 inline-flex items-center gap-2 font-black text-ink"><LayoutTemplate className="h-4 w-4" /> {page.title}</div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Page title"
                onChange={(event) => updateLandingPage(page.id, { title: event.target.value })}
                value={page.title}
              />
              <Input
                label="Slug"
                onChange={(event) => updateLandingPage(page.id, { slug: event.target.value })}
                value={page.slug}
              />
              <Input
                label="SEO title"
                onChange={(event) => updateLandingPage(page.id, { seoTitle: event.target.value })}
                value={page.seoTitle}
              />
              <Select
                label="Publish status"
                onChange={(event) => updateLandingPage(page.id, { status: event.target.value as CmsPublishStatus })}
                value={page.status}
              >
                {statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
              </Select>
              <div className="md:col-span-2">
                <Textarea
                  label="SEO description"
                  onChange={(value) => updateLandingPage(page.id, { seoDescription: value })}
                  value={page.seoDescription}
                />
              </div>
            </div>

            <div className="mt-5 rounded-md bg-mist p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-black text-ink">Landing page sections</p>
                <button className="admin-action" onClick={() => addLandingSection(page.id)} type="button">
                  Add landing section
                </button>
              </div>
              {page.sections.length === 0 ? (
                <p className="mt-3 text-sm text-slate">No sections yet. Add a section to edit photo, content, alignment, and links.</p>
              ) : null}
              <div className="mt-4 grid gap-4">
                {page.sections.map((section) => (
                  <div className="rounded-md border border-black/10 bg-white p-4" key={section.id}>
                    <div className="grid gap-4 md:grid-cols-2">
                      <Input
                        label="Section title"
                        onChange={(event) => updateLandingSection(page.id, section.id, { title: event.target.value })}
                        value={section.title}
                      />
                      <Select
                        label="Section type"
                        onChange={(event) => updateLandingSection(page.id, section.id, { type: event.target.value as HomepageSectionType })}
                        value={section.type}
                      >
                        {sectionTypes.map((type) => <option key={type} value={type}>{label(type)}</option>)}
                      </Select>
                      <div className="md:col-span-2">
                        <Textarea
                          label="Section content"
                          onChange={(value) => updateLandingSection(page.id, section.id, { subtitle: value })}
                          value={section.subtitle ?? ""}
                        />
                      </div>
                      <Input
                        label="Photo / banner image"
                        onChange={(event) => updateLandingSection(page.id, section.id, { desktopImageUrl: event.target.value })}
                        placeholder="https://..."
                        value={section.desktopImageUrl ?? ""}
                      />
                      <Input
                        label="CTA text"
                        onChange={(event) => updateLandingSection(page.id, section.id, { ctaLabel: event.target.value })}
                        value={section.ctaLabel ?? ""}
                      />
                      <Input
                        label="CTA link"
                        onChange={(event) => updateLandingSection(page.id, section.id, { ctaLink: event.target.value })}
                        value={section.ctaLink ?? ""}
                      />
                      <Select
                        label="Background"
                        onChange={(event) => updateLandingSection(page.id, section.id, { backgroundStyle: event.target.value as HomepageSection["backgroundStyle"] })}
                        value={section.backgroundStyle}
                      >
                        {["white", "mist", "ink", "mint", "image"].map((style) => <option key={style} value={style}>{label(style)}</option>)}
                      </Select>
                      <Select
                        label="Alignment"
                        onChange={(event) => updateLandingSection(page.id, section.id, { contentAlignment: event.target.value as CmsSectionAlignment })}
                        value={section.contentAlignment ?? "left"}
                      >
                        {alignments.map((alignment) => <option key={alignment} value={alignment}>{label(alignment)}</option>)}
                      </Select>
                      <Input
                        label="Order"
                        min={1}
                        onChange={(event) => updateLandingSection(page.id, section.id, { order: Number(event.target.value) })}
                        type="number"
                        value={section.order}
                      />
                      <label className="flex items-center gap-2 rounded-md border border-black/10 p-3 text-sm font-bold text-ink">
                        <input
                          checked={section.enabled}
                          onChange={(event) => updateLandingSection(page.id, section.id, { enabled: event.target.checked })}
                          type="checkbox"
                        />
                        Visible on landing page
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

function BlogManager({ data, setData }: { data: WebsiteStudioData; setData: (data: WebsiteStudioData) => void }) {
  return (
    <AdminCard title="Blog CMS">
      <div className="grid gap-5">
        {data.blogPosts.map((post) => (
          <div className="rounded-md border border-black/10 p-4" key={post.id}>
            <div className="mb-4 inline-flex items-center gap-2 font-black text-ink"><FileText className="h-4 w-4" /> {post.title}</div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Post title"
                onChange={(event) =>
                  setData({ ...data, blogPosts: data.blogPosts.map((entry) => entry.id === post.id ? { ...entry, title: event.target.value } : entry) })
                }
                value={post.title}
              />
              <Input
                label="Slug"
                onChange={(event) =>
                  setData({ ...data, blogPosts: data.blogPosts.map((entry) => entry.id === post.id ? { ...entry, slug: event.target.value } : entry) })
                }
                value={post.slug}
              />
              <Input
                label="Author"
                onChange={(event) =>
                  setData({ ...data, blogPosts: data.blogPosts.map((entry) => entry.id === post.id ? { ...entry, author: event.target.value } : entry) })
                }
                value={post.author}
              />
              <Input
                label="Category"
                onChange={(event) =>
                  setData({ ...data, blogPosts: data.blogPosts.map((entry) => entry.id === post.id ? { ...entry, category: event.target.value } : entry) })
                }
                value={post.category}
              />
              <Input
                label="Featured image"
                onChange={(event) =>
                  setData({ ...data, blogPosts: data.blogPosts.map((entry) => entry.id === post.id ? { ...entry, featuredImageUrl: event.target.value } : entry) })
                }
                value={post.featuredImageUrl ?? ""}
              />
              <Select
                label="Publish status"
                onChange={(event) =>
                  setData({ ...data, blogPosts: data.blogPosts.map((entry) => entry.id === post.id ? { ...entry, status: event.target.value as CmsPublishStatus } : entry) })
                }
                value={post.status}
              >
                {statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
              </Select>
              <Input
                label="SEO title"
                onChange={(event) =>
                  setData({ ...data, blogPosts: data.blogPosts.map((entry) => entry.id === post.id ? { ...entry, seoTitle: event.target.value } : entry) })
                }
                value={post.seoTitle}
              />
              <label className="flex items-center gap-2 rounded-md border border-black/10 p-3 text-sm font-bold text-ink">
                <input
                  checked={post.disclaimerEnabled}
                  onChange={(event) =>
                    setData({
                      ...data,
                      blogPosts: data.blogPosts.map((entry) => entry.id === post.id ? { ...entry, disclaimerEnabled: event.target.checked } : entry)
                    })
                  }
                  type="checkbox"
                />
                Disclaimer enabled
              </label>
              <div className="md:col-span-2">
                <Textarea
                  label="SEO description"
                  onChange={(value) =>
                    setData({ ...data, blogPosts: data.blogPosts.map((entry) => entry.id === post.id ? { ...entry, seoDescription: value } : entry) })
                  }
                  value={post.seoDescription}
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="Post content"
                  onChange={(value) =>
                    setData({ ...data, blogPosts: data.blogPosts.map((entry) => entry.id === post.id ? { ...entry, content: value } : entry) })
                  }
                  rows={6}
                  value={post.content}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </AdminCard>
  );
}

function PolicyManager({ data, setData }: { data: WebsiteStudioData; setData: (data: WebsiteStudioData) => void }) {
  return (
    <AdminCard title="Policy pages">
      <div className="grid gap-5">
        {data.policies.map((page) => (
          <div className="rounded-md border border-black/10 p-4" key={page.id}>
            <div className="mb-4 font-black text-ink">{page.title}</div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Policy title"
                onChange={(event) =>
                  setData({ ...data, policies: data.policies.map((entry) => entry.id === page.id ? { ...entry, title: event.target.value } : entry) })
                }
                value={page.title}
              />
              <Input
                label="Slug"
                onChange={(event) =>
                  setData({ ...data, policies: data.policies.map((entry) => entry.id === page.id ? { ...entry, slug: event.target.value } : entry) })
                }
                value={page.slug}
              />
              <Input
                label="SEO title"
                onChange={(event) =>
                  setData({ ...data, policies: data.policies.map((entry) => entry.id === page.id ? { ...entry, seoTitle: event.target.value } : entry) })
                }
                value={page.seoTitle}
              />
              <Select
                label="Publish status"
                onChange={(event) =>
                  setData({ ...data, policies: data.policies.map((entry) => entry.id === page.id ? { ...entry, status: event.target.value as CmsPublishStatus } : entry) })
                }
                value={page.status}
              >
                {statuses.map((status) => <option key={status} value={status}>{label(status)}</option>)}
              </Select>
              <div className="md:col-span-2">
                <Textarea
                  label="SEO description"
                  onChange={(value) =>
                    setData({ ...data, policies: data.policies.map((entry) => entry.id === page.id ? { ...entry, seoDescription: value } : entry) })
                  }
                  value={page.seoDescription}
                />
              </div>
              <div className="md:col-span-2">
                <Textarea
                  label="Page content"
                  onChange={(value) =>
                    setData({ ...data, policies: data.policies.map((entry) => entry.id === page.id ? { ...entry, content: value } : entry) })
                  }
                  rows={6}
                  value={page.content}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
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

function Textarea({
  label: textareaLabel,
  onChange,
  rows = 4,
  value
}: {
  label: string;
  onChange: (value: string) => void;
  rows?: number;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{textareaLabel}</span>
      <textarea
        className="focus-ring w-full rounded-md border border-black/10 bg-white px-3 py-3 text-sm leading-6 text-ink placeholder:text-slate"
        onChange={(event) => onChange(event.target.value)}
        rows={rows}
        value={value}
      />
    </label>
  );
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
