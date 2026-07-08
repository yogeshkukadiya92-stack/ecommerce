"use client";

import { useMemo, useState } from "react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BarChart3,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  FileText,
  Globe,
  ImageIcon,
  Layers3,
  LayoutTemplate,
  Link2,
  ListChecks,
  Megaphone,
  MonitorSmartphone,
  PanelTop,
  Plus,
  Save,
  Send,
  Sparkles,
  Target,
  Trash2
} from "lucide-react";
import { websiteStudioData } from "@/mock/cms";
import type {
  CmsContentReference,
  CmsMenuItem,
  CmsPublishStatus,
  CmsSectionAlignment,
  HomepageSection,
  HomepageSectionType,
  MenuLinkType,
  WebsiteStudioData
} from "@/types/cms";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { showDemoData } from "@/lib/admin/liveData";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import { readWebsiteStudioDraft, writeWebsiteStudioDraft } from "@/lib/cms/cmsLocalStorage";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { HomepageSectionRenderer } from "@/components/cms/HomepageSectionRenderer";
import { AdminCard } from "./AdminCard";
import { ImageUploadField } from "./ImageUploadField";
import { AdminTable } from "./AdminTable";
import { LiveAdminEmptyState } from "./LiveAdminEmptyState";

const tabs = [
  "Homepage",
  "Specifics",
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
type StudioHealth = ReturnType<typeof buildStudioHealth>;

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
  if (!showDemoData && !readWebsiteStudioDraft()) {
    return (
      <LiveAdminEmptyState
        actionHref="/admin/settings"
        actionLabel="Configure CMS"
        title="Website Studio is ready for real content"
        description="Sample homepage sections, banners, menus, policies, and blog content are hidden in live mode. Add production CMS records before publishing storefront content."
      />
    );
  }

  return <DemoWebsiteStudioClient autoSaveChanges={autoSaveChanges} initialTab={initialTab} tabsLocked={tabsLocked} />;
}

function DemoWebsiteStudioClient({
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
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "mobile">("desktop");
  const [toast, setToast] = useState("");
  const selectedSection = studioData.homepageSections.find((section) => section.id === selectedSectionId) ?? studioData.homepageSections[0];
  const health = useMemo(() => buildStudioHealth(studioData), [studioData]);

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

  function addHomepageSection() {
    const nextOrder = Math.max(0, ...studioData.homepageSections.map((section) => section.order)) + 1;
    const section: HomepageSection = {
      backgroundStyle: "white",
      contentAlignment: "left",
      ctaLabel: "Shop now",
      ctaLink: "/products",
      enabled: true,
      id: `home-section-${Date.now()}`,
      order: nextOrder,
      references: [],
      status: "draft",
      subtitle: "Edit this content from Website Editor.",
      title: "New homepage section",
      type: "image_banner"
    };
    const nextData = { ...studioData, homepageSections: [...studioData.homepageSections, section] };

    setSelectedSectionId(section.id);
    updateStudioData(nextData);
  }

  function duplicateHomepageSection(sectionId: string) {
    const source = studioData.homepageSections.find((section) => section.id === sectionId);

    if (!source) return;

    const copy: HomepageSection = {
      ...source,
      id: `${source.id}-copy-${Date.now()}`,
      order: Math.max(0, ...studioData.homepageSections.map((section) => section.order)) + 1,
      status: "draft",
      title: `${source.title} Copy`
    };
    const nextData = { ...studioData, homepageSections: [...studioData.homepageSections, copy] };

    setSelectedSectionId(copy.id);
    updateStudioData(nextData);
  }

  function deleteHomepageSection(sectionId: string) {
    if (studioData.homepageSections.length <= 1) {
      setToast("Keep at least one homepage section.");
      return;
    }

    if (!window.confirm("Delete this homepage section from the draft?")) {
      return;
    }

    const remainingSections = studioData.homepageSections.filter((section) => section.id !== sectionId);
    const nextData = { ...studioData, homepageSections: remainingSections };

    if (selectedSectionId === sectionId) {
      setSelectedSectionId(remainingSections[0]?.id ?? "");
    }

    updateStudioData(nextData);
  }

  function moveSection(sectionId: string, direction: -1 | 1) {
    const ordered = [...studioData.homepageSections].sort((first, second) => first.order - second.order);
    const index = ordered.findIndex((section) => section.id === sectionId);
    const nextIndex = index + direction;

    if (index < 0 || nextIndex < 0 || nextIndex >= ordered.length) return;

    const currentOrder = ordered[index].order;
    ordered[index].order = ordered[nextIndex].order;
    ordered[nextIndex].order = currentOrder;

    updateStudioData({
      ...studioData,
      homepageSections: studioData.homepageSections.map((section) => ordered.find((entry) => entry.id === section.id) ?? section)
    });
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

    commit(nextData, "cms.publish", "Published homepage CMS sections to the storefront.");
  }

  return (
    <div className="space-y-6">
      {toast ? <div className="rounded-md bg-mint px-4 py-3 text-sm font-semibold text-forest">{toast}</div> : null}

      <StudioCommandCenter
        health={health}
        previewMode={previewMode}
        publish={publish}
        saveDraft={saveDraft}
        setPreviewMode={setPreviewMode}
      />

      {tabsLocked ? null : (
        <StudioTabs activeTab={activeTab} health={health} setActiveTab={setActiveTab} />
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_420px]">
        <div className="min-w-0 space-y-6">
          {activeTab === "Homepage" ? (
            <HomepageBuilder
              addSection={addHomepageSection}
              deleteSection={deleteHomepageSection}
              duplicateSection={duplicateHomepageSection}
              health={health}
              moveSection={moveSection}
              selectedSection={selectedSection}
              selectedSectionId={selectedSectionId}
              sections={studioData.homepageSections}
              setSelectedSectionId={setSelectedSectionId}
              updateSection={updateSection}
            />
          ) : null}
          {activeTab === "Specifics" ? (
            <SpecificsManager
              data={studioData}
              selectedSectionId={selectedSectionId}
              setData={updateStudioData}
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
          <ContentHealthCard health={health} />

          <AdminCard description="Save drafts while editing, publish when every checklist item looks ready." title="Publishing workflow">
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
          </AdminCard>

          <AdminCard action={<PreviewViewportControls previewViewport={previewViewport} setPreviewViewport={setPreviewViewport} />} title="Homepage preview">
            <div className={`max-h-[720px] overflow-y-auto rounded-md border border-black/10 bg-mist ${previewViewport === "mobile" ? "p-3" : ""}`}>
              <div className={`${previewViewport === "mobile" ? "mx-auto max-w-[390px] origin-top scale-[0.94]" : "origin-top scale-[0.78]"}`}>
                <HomepageSectionRenderer preview sections={publishedSections.slice(0, 4)} />
              </div>
            </div>
          </AdminCard>

          {selectedSection ? (
            <AdminCard action={<PreviewViewportControls previewViewport={previewViewport} setPreviewViewport={setPreviewViewport} />} title="Selected section live preview">
              <div className={`max-h-[520px] overflow-y-auto rounded-md border border-black/10 bg-mist ${previewViewport === "mobile" ? "p-3" : ""}`}>
                <div className={`${previewViewport === "mobile" ? "mx-auto max-w-[390px] origin-top scale-[0.94]" : "origin-top scale-[0.78]"}`}>
                  <HomepageSectionRenderer preview sections={[selectedSection]} />
                </div>
              </div>
            </AdminCard>
          ) : null}
        </aside>
      </div>
    </div>
  );
}

function HomepageBuilder({
  addSection,
  deleteSection,
  duplicateSection,
  health,
  moveSection,
  selectedSection,
  selectedSectionId,
  sections,
  setSelectedSectionId,
  updateSection
}: {
  addSection: () => void;
  deleteSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  health: StudioHealth;
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
      <WebsiteBuilderChecklist health={health} sections={sections} setSelectedSectionId={setSelectedSectionId} />

      <AdminCard title="Homepage builder">
        <div className="mb-4 flex flex-wrap justify-end gap-2">
          <button className="admin-action" onClick={addSection} type="button">
            <Plus className="h-4 w-4" /> Add section
          </button>
        </div>
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
                <button className="admin-action" onClick={() => duplicateSection(section.id)} type="button"><Copy className="h-4 w-4" /></button>
                <button className="admin-action text-coral" onClick={() => deleteSection(section.id)} type="button"><Trash2 className="h-4 w-4" /></button>
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
          <ImageUrlField label="Desktop banner image" onChange={(value) => updateSection(selectedSectionId, { desktopImageUrl: value })} value={selectedSection.desktopImageUrl ?? ""} />
          <ImageUrlField label="Mobile banner image" onChange={(value) => updateSection(selectedSectionId, { mobileImageUrl: value })} value={selectedSection.mobileImageUrl ?? ""} />
          <Input label="CTA button text" onChange={(event) => updateSection(selectedSectionId, { ctaLabel: event.target.value })} value={selectedSection.ctaLabel ?? ""} />
          <Input label="CTA link" onChange={(event) => updateSection(selectedSectionId, { ctaLink: event.target.value })} value={selectedSection.ctaLink ?? ""} />
          <Select label="Background style" onChange={(event) => updateSection(selectedSectionId, { backgroundStyle: event.target.value as HomepageSection["backgroundStyle"] })} value={selectedSection.backgroundStyle}>
            {["white", "mist", "ink", "mint", "image"].map((style) => <option key={style} value={style}>{label(style)}</option>)}
          </Select>
          <Select label="Content alignment" onChange={(event) => updateSection(selectedSectionId, { contentAlignment: event.target.value as CmsSectionAlignment })} value={selectedSection.contentAlignment ?? "left"}>
            {alignments.map((alignment) => <option key={alignment} value={alignment}>{label(alignment)}</option>)}
          </Select>
          <Input label="Schedule publish date" onChange={(event) => updateSection(selectedSectionId, { publishAt: event.target.value })} type="datetime-local" value={selectedSection.publishAt ?? ""} />
          <Input label="Video URL" onChange={(event) => updateSection(selectedSectionId, { videoUrl: event.target.value })} value={selectedSection.videoUrl ?? ""} />
        </div>
        <div className="mt-4">
          <Textarea
            label="Preview note"
            onChange={(value) => updateSection(selectedSectionId, { previewNote: value })}
            value={selectedSection.previewNote ?? ""}
          />
        </div>
        <SectionSpecificsPanel selectedSection={selectedSection} selectedSectionId={selectedSectionId} updateSection={updateSection} />
      </AdminCard>
    </>
  );
}

function WebsiteBuilderChecklist({
  health,
  sections,
  setSelectedSectionId
}: {
  health: StudioHealth;
  sections: HomepageSection[];
  setSelectedSectionId: (sectionId: string) => void;
}) {
  const missingTitles = sections.filter((section) => !section.title.trim());
  const missingDesktopImages = sections.filter(sectionNeedsImage);
  const missingMobileImages = sections.filter(sectionNeedsMobileImage);
  const missingCtas = sections.filter(sectionNeedsCta);
  const notPublished = sections.filter((section) => section.enabled && section.status !== "published");
  const hiddenSections = sections.filter((section) => !section.enabled);

  const checklist = [
    {
      detail: "Every section should have a clear owner-facing title.",
      icon: Layers3,
      items: missingTitles,
      label: "Section titles"
    },
    {
      detail: "Hero and image sections need desktop artwork before launch.",
      icon: ImageIcon,
      items: missingDesktopImages,
      label: "Desktop images"
    },
    {
      detail: "Mobile hero images keep the storefront clean on phones.",
      icon: MonitorSmartphone,
      items: missingMobileImages,
      label: "Mobile images"
    },
    {
      detail: "Conversion sections need button text and a working link.",
      icon: Target,
      items: missingCtas,
      label: "CTA buttons"
    },
    {
      detail: "Visible sections should be published when content is final.",
      icon: Send,
      items: notPublished,
      label: "Publish status"
    },
    {
      detail: "Review hidden sections and enable only the ones needed on the live site.",
      icon: Eye,
      items: hiddenSections,
      label: "Visibility"
    }
  ];
  const completed = checklist.filter((item) => item.items.length === 0).length;
  const checklistScore = Math.round((completed / checklist.length) * 100);
  const combinedScore = Math.round((checklistScore + health.score) / 2);

  return (
    <AdminCard
      action={<Badge tone={combinedScore >= 85 ? "success" : "sale"}>{combinedScore}% score</Badge>}
      description="Use this launch checklist to see exactly which homepage changes are still pending."
      title="Website builder checklist"
    >
      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-md border border-black/10 bg-ink p-4 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-md bg-lime text-ink">
              <ListChecks className="h-5 w-5" />
            </div>
            <span className="text-3xl font-black">{combinedScore}%</span>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/15">
            <div className="h-full rounded-full bg-lime" style={{ width: `${combinedScore}%` }} />
          </div>
          <p className="mt-4 text-sm font-black">{completed} of {checklist.length} checks complete</p>
          <p className="mt-1 text-xs leading-5 text-white/70">
            {checklist.length - completed ? `${checklist.length - completed} improvement area${checklist.length - completed === 1 ? "" : "s"} left` : "Homepage is ready for owner review"}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          {checklist.map((item) => {
            const Icon = item.icon;
            const firstSection = item.items[0];
            const ok = item.items.length === 0;

            return (
              <div className="rounded-md border border-black/10 bg-mist p-4" key={item.label}>
                <div className="flex items-start justify-between gap-3">
                  <div className={`grid h-9 w-9 shrink-0 place-items-center rounded-md ${ok ? "bg-mint text-forest" : "bg-coral/10 text-coral"}`}>
                    {ok ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <Badge tone={ok ? "success" : "sale"}>{ok ? "Done" : `${item.items.length} pending`}</Badge>
                </div>
                <p className="mt-3 text-sm font-black text-ink">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate">{item.detail}</p>
                {firstSection ? (
                  <button className="admin-action mt-3" onClick={() => setSelectedSectionId(firstSection.id)} type="button">
                    <Eye className="h-4 w-4" /> Inspect {firstSection.title || "section"}
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </AdminCard>
  );
}

function SpecificsManager({
  data,
  selectedSectionId,
  setData,
  setSelectedSectionId,
  updateSection
}: {
  data: WebsiteStudioData;
  selectedSectionId: string;
  setData: (data: WebsiteStudioData) => void;
  setSelectedSectionId: (sectionId: string) => void;
  updateSection: (sectionId: string, patch: Partial<HomepageSection>) => void;
}) {
  const health = buildStudioHealth(data);
  const selectedSection = data.homepageSections.find((section) => section.id === selectedSectionId) ?? data.homepageSections[0];

  function updateSeo(index: number, patch: Partial<WebsiteStudioData["seo"][number]>) {
    setData({
      ...data,
      seo: data.seo.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...patch } : entry))
    });
  }

  return (
    <div className="space-y-6">
      <AdminCard
        action={<Badge tone={health.score >= 85 ? "success" : "sale"}>{health.score}% ready</Badge>}
        description="Homepage, navigation, campaign, SEO, and compliance signals in one editing surface."
        title="Website specifics"
      >
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <StudioMetric icon={Layers3} label="Homepage sections" value={health.totalSections} />
          <StudioMetric icon={PanelTop} label="Menu links" value={health.menuLinks} />
          <StudioMetric icon={Target} label="Active banners" value={health.activeBanners} />
          <StudioMetric icon={BarChart3} label="SEO pages" value={health.seoPages} />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {health.checks.map((check) => (
            <div
              className={`flex items-start gap-3 rounded-md border p-3 ${
                check.ok ? "border-forest/20 bg-mint/60 text-forest" : "border-coral/20 bg-coral/10 text-coral"
              }`}
              key={check.label}
            >
              {check.ok ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
              <div>
                <p className="text-sm font-black">{check.label}</p>
                <p className="mt-1 text-xs leading-5 text-inherit opacity-80">{check.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="Homepage section specifics">
        <AdminTable
          columns={["Section", "Type", "Image", "CTA", "Status", "Action"]}
          rows={[...data.homepageSections]
            .sort((first, second) => first.order - second.order)
            .map((section) => [
              <button
                className="text-left font-black text-ink"
                key="section"
                onClick={() => setSelectedSectionId(section.id)}
                type="button"
              >
                {section.title || "Untitled section"}
              </button>,
              label(section.type),
              <Badge key="image" tone={sectionNeedsImage(section) ? "sale" : "success"}>
                {sectionNeedsImage(section) ? "Needs image" : "Ready"}
              </Badge>,
              <Badge key="cta" tone={sectionNeedsCta(section) ? "sale" : "success"}>
                {sectionNeedsCta(section) ? "Needs CTA" : "Ready"}
              </Badge>,
              <Badge key="status" tone={section.status === "published" ? "success" : "neutral"}>{label(section.status)}</Badge>,
              <button
                className="admin-action"
                key="action"
                onClick={() => setSelectedSectionId(section.id)}
                type="button"
              >
                <Eye className="h-4 w-4" /> Inspect
              </button>
            ])}
        />
        {selectedSection ? (
          <div className="mt-5 rounded-md border border-black/10 bg-mist p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-ink">Focused section details</p>
                <p className="mt-1 text-xs text-slate">{selectedSection.title}</p>
              </div>
              <Badge tone={selectedSection.enabled ? "success" : "neutral"}>{selectedSection.enabled ? "Visible" : "Hidden"}</Badge>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input label="CTA label" onChange={(event) => updateSection(selectedSection.id, { ctaLabel: event.target.value })} value={selectedSection.ctaLabel ?? ""} />
              <Input label="CTA link" onChange={(event) => updateSection(selectedSection.id, { ctaLink: event.target.value })} value={selectedSection.ctaLink ?? ""} />
              <ImageUrlField label="Desktop image" onChange={(value) => updateSection(selectedSection.id, { desktopImageUrl: value })} value={selectedSection.desktopImageUrl ?? ""} />
              <ImageUrlField label="Mobile image" onChange={(value) => updateSection(selectedSection.id, { mobileImageUrl: value })} value={selectedSection.mobileImageUrl ?? ""} />
            </div>
            <SectionSpecificsPanel selectedSection={selectedSection} selectedSectionId={selectedSection.id} updateSection={updateSection} />
          </div>
        ) : null}
      </AdminCard>

      <AdminCard title="Header, footer, and trust specifics">
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Logo text" onChange={(event) => setData({ ...data, header: { ...data.header, logoText: event.target.value } })} value={data.header.logoText} />
          <Input label="Announcement text" onChange={(event) => setData({ ...data, header: { ...data.header, announcementText: event.target.value } })} value={data.header.announcementText} />
          <Input label="Footer phone" onChange={(event) => setData({ ...data, footer: { ...data.footer, contactPhone: event.target.value } })} value={data.footer.contactPhone} />
          <Input label="Footer email" onChange={(event) => setData({ ...data, footer: { ...data.footer, contactEmail: event.target.value } })} value={data.footer.contactEmail} />
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {(["enableSearch", "enableAccount", "enableWishlist", "enableCart"] as const).map((key) => (
            <label className="flex items-center gap-2 rounded-md border border-black/10 bg-white p-3 text-sm font-bold text-ink" key={key}>
              <input checked={data.header[key]} onChange={(event) => setData({ ...data, header: { ...data.header, [key]: event.target.checked } })} type="checkbox" />
              {label(key.replace("enable", ""))}
            </label>
          ))}
        </div>
      </AdminCard>

      <AdminCard title="SEO page specifics">
        <div className="grid gap-4">
          {data.seo.map((entry, index) => (
            <div className="rounded-md border border-black/10 p-4" key={entry.pageKey}>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center gap-2 font-black text-ink">
                  <Globe className="h-4 w-4" /> {label(entry.pageKey)}
                </span>
                <Badge tone={entry.noindex ? "sale" : "success"}>{entry.noindex ? "Noindex" : "Indexable"}</Badge>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Input label="SEO title" onChange={(event) => updateSeo(index, { title: event.target.value })} value={entry.title} />
                <Input label="Canonical URL" onChange={(event) => updateSeo(index, { canonicalUrl: event.target.value })} value={entry.canonicalUrl ?? ""} />
                <div className="md:col-span-2">
                  <Textarea label="Meta description" onChange={(value) => updateSeo(index, { metaDescription: value })} value={entry.metaDescription} />
                </div>
                <ImageUrlField label="Open Graph image" onChange={(value) => updateSeo(index, { ogImageUrl: value })} value={entry.ogImageUrl ?? ""} />
                <label className="flex items-center gap-2 rounded-md border border-black/10 p-3 text-sm font-bold text-ink">
                  <input checked={entry.noindex} onChange={(event) => updateSeo(index, { noindex: event.target.checked })} type="checkbox" />
                  Noindex page
                </label>
              </div>
            </div>
          ))}
        </div>
      </AdminCard>
    </div>
  );
}

function SectionSpecificsPanel({
  selectedSection,
  selectedSectionId,
  updateSection
}: {
  selectedSection: HomepageSection;
  selectedSectionId: string;
  updateSection: (sectionId: string, patch: Partial<HomepageSection>) => void;
}) {
  return (
    <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
      <ReferenceEditor
        references={selectedSection.references}
        sectionId={selectedSectionId}
        updateSection={updateSection}
      />
      <div className="rounded-md border border-black/10 bg-white p-4">
        <p className="text-sm font-black text-ink">Readiness</p>
        <div className="mt-3 grid gap-2">
          <ReadinessRow ok={Boolean(selectedSection.title.trim())} text="Section title" />
          <ReadinessRow ok={!sectionNeedsImage(selectedSection)} text="Desktop image" />
          <ReadinessRow ok={!sectionNeedsCta(selectedSection)} text="CTA action" />
          <ReadinessRow ok={selectedSection.enabled} text="Visible toggle" />
          <ReadinessRow ok={selectedSection.status === "published"} text="Published status" />
        </div>
      </div>
    </div>
  );
}

function ReferenceEditor({
  references,
  sectionId,
  updateSection
}: {
  references: CmsContentReference[];
  sectionId: string;
  updateSection: (sectionId: string, patch: Partial<HomepageSection>) => void;
}) {
  function updateReference(referenceId: string, patch: Partial<CmsContentReference>) {
    updateSection(sectionId, {
      references: references.map((reference) => (reference.id === referenceId ? { ...reference, ...patch } : reference))
    });
  }

  function addReference() {
    updateSection(sectionId, {
      references: [
        ...references,
        {
          id: `ref-${Date.now()}`,
          label: "New reference",
          type: "custom_url",
          url: "/products"
        }
      ]
    });
  }

  function deleteReference(referenceId: string) {
    updateSection(sectionId, {
      references: references.filter((reference) => reference.id !== referenceId)
    });
  }

  return (
    <div className="rounded-md border border-black/10 bg-white p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-black text-ink">Linked products, pages, and collections</p>
        <button className="admin-action" onClick={addReference} type="button">
          <Plus className="h-4 w-4" /> Add link
        </button>
      </div>
      <div className="grid gap-3">
        {references.map((reference) => (
          <div className="grid gap-3 rounded-md bg-mist p-3 md:grid-cols-[1fr_160px_1fr_auto] md:items-end" key={reference.id}>
            <Input label="Label" onChange={(event) => updateReference(reference.id, { label: event.target.value })} value={reference.label} />
            <Select label="Type" onChange={(event) => updateReference(reference.id, { type: event.target.value as CmsContentReference["type"] })} value={reference.type}>
              {["product", "category", "brand", "collection", "blog", "page", "custom_url"].map((type) => <option key={type} value={type}>{label(type)}</option>)}
            </Select>
            <Input label="URL" onChange={(event) => updateReference(reference.id, { url: event.target.value })} value={reference.url ?? ""} />
            <button className="admin-action text-coral" onClick={() => deleteReference(reference.id)} type="button">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
        {references.length === 0 ? (
          <div className="rounded-md bg-mist p-4 text-sm text-slate">
            <Link2 className="mb-2 h-4 w-4" /> Add product, category, brand, page, or custom URL references for this section.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function ReadinessRow({ ok, text }: { ok: boolean; text: string }) {
  return (
    <div className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-black ${ok ? "bg-mint text-forest" : "bg-coral/10 text-coral"}`}>
      {ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
      {text}
    </div>
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
  function updateMenuItem(itemId: string, patch: Partial<CmsMenuItem>) {
    setData({
      ...data,
      header: {
        ...data.header,
        megaMenuItems: data.header.megaMenuItems.map((item) => item.id === itemId ? { ...item, ...patch } : item)
      }
    });
  }

  function updateChildMenuItem(itemId: string, childId: string, patch: Partial<CmsMenuItem>) {
    setData({
      ...data,
      header: {
        ...data.header,
        megaMenuItems: data.header.megaMenuItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                children: item.children?.map((child) => child.id === childId ? { ...child, ...patch } : child) ?? []
              }
            : item
        )
      }
    });
  }

  function addMenuItem() {
    setData({
      ...data,
      header: {
        ...data.header,
        megaMenuItems: [
          ...data.header.megaMenuItems,
          {
            enabled: true,
            id: `menu-${Date.now()}`,
            label: "New menu item",
            linkType: "custom_url",
            url: "/products"
          }
        ]
      }
    });
  }

  function addChildMenuItem(itemId: string) {
    setData({
      ...data,
      header: {
        ...data.header,
        megaMenuItems: data.header.megaMenuItems.map((item) =>
          item.id === itemId
            ? {
                ...item,
                children: [
                  ...(item.children ?? []),
                  {
                    enabled: true,
                    id: `menu-child-${Date.now()}`,
                    label: "New child link",
                    linkType: "custom_url",
                    url: "/products"
                  }
                ]
              }
            : item
        )
      }
    });
  }

  function deleteMenuItem(itemId: string) {
    if (!window.confirm("Delete this menu item?")) return;

    setData({
      ...data,
      header: {
        ...data.header,
        megaMenuItems: data.header.megaMenuItems.filter((item) => item.id !== itemId)
      }
    });
  }

  function deleteChildMenuItem(itemId: string, childId: string) {
    setData({
      ...data,
      header: {
        ...data.header,
        megaMenuItems: data.header.megaMenuItems.map((item) =>
          item.id === itemId
            ? { ...item, children: item.children?.filter((child) => child.id !== childId) ?? [] }
            : item
        )
      }
    });
  }

  return (
    <AdminCard title="Header and menu builder">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Logo text" onChange={(event) => setData({ ...data, header: { ...data.header, logoText: event.target.value } })} value={data.header.logoText} />
        <ImageUrlField label="Logo image" onChange={(value) => setData({ ...data, header: { ...data.header, logoUrl: value } })} value={data.header.logoUrl ?? ""} />
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
      <div className="mt-6 rounded-md bg-mist p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-black text-ink">Mega menu editor</p>
          <button className="admin-action" onClick={addMenuItem} type="button">
            <Plus className="h-4 w-4" /> Add menu item
          </button>
        </div>
        <div className="grid gap-4">
          {data.header.megaMenuItems.map((item) => (
            <div className="rounded-md border border-black/10 bg-white p-4" key={item.id}>
              <div className="grid gap-4 md:grid-cols-[1fr_160px_1fr_auto] md:items-end">
                <Input label="Label" onChange={(event) => updateMenuItem(item.id, { label: event.target.value })} value={item.label} />
                <Select label="Link type" onChange={(event) => updateMenuItem(item.id, { linkType: event.target.value as MenuLinkType })} value={item.linkType}>
                  {["category", "brand", "page", "custom_url"].map((type) => <option key={type} value={type}>{label(type)}</option>)}
                </Select>
                <Input label="URL" onChange={(event) => updateMenuItem(item.id, { url: event.target.value })} value={item.url} />
                <button className="admin-action text-coral" onClick={() => deleteMenuItem(item.id)} type="button">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm font-bold text-ink">
                <input checked={item.enabled} onChange={(event) => updateMenuItem(item.id, { enabled: event.target.checked })} type="checkbox" />
                Enabled
              </label>
              <div className="mt-4 rounded-md bg-mist p-3">
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate">Nested links</p>
                  <button className="admin-action" onClick={() => addChildMenuItem(item.id)} type="button">
                    <Plus className="h-4 w-4" /> Add child
                  </button>
                </div>
                <div className="grid gap-3">
                  {(item.children ?? []).map((child) => (
                    <div className="grid gap-3 rounded-md bg-white p-3 md:grid-cols-[1fr_160px_1fr_auto] md:items-end" key={child.id}>
                      <Input label="Child label" onChange={(event) => updateChildMenuItem(item.id, child.id, { label: event.target.value })} value={child.label} />
                      <Select label="Type" onChange={(event) => updateChildMenuItem(item.id, child.id, { linkType: event.target.value as MenuLinkType })} value={child.linkType}>
                        {["category", "brand", "page", "custom_url"].map((type) => <option key={type} value={type}>{label(type)}</option>)}
                      </Select>
                      <Input label="Child URL" onChange={(event) => updateChildMenuItem(item.id, child.id, { url: event.target.value })} value={child.url} />
                      <button className="admin-action text-coral" onClick={() => deleteChildMenuItem(item.id, child.id)} type="button">
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <label className="flex items-center gap-2 text-sm font-bold text-ink md:col-span-4">
                        <input checked={child.enabled} onChange={(event) => updateChildMenuItem(item.id, child.id, { enabled: event.target.checked })} type="checkbox" />
                        Child enabled
                      </label>
                    </div>
                  ))}
                  {item.children?.length ? null : <p className="text-sm text-slate">No nested links yet.</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AdminCard>
  );
}

function FooterBuilder({ data, setData }: { data: WebsiteStudioData; setData: (data: WebsiteStudioData) => void }) {
  function updateFooterColumn(columnId: string, patch: Partial<WebsiteStudioData["footer"]["footerColumns"][number]>) {
    setData({
      ...data,
      footer: {
        ...data.footer,
        footerColumns: data.footer.footerColumns.map((column) => column.id === columnId ? { ...column, ...patch } : column)
      }
    });
  }

  function updateFooterLink(columnId: string, linkId: string, patch: Partial<WebsiteStudioData["footer"]["footerColumns"][number]["links"][number]>) {
    setData({
      ...data,
      footer: {
        ...data.footer,
        footerColumns: data.footer.footerColumns.map((column) =>
          column.id === columnId
            ? { ...column, links: column.links.map((link) => link.id === linkId ? { ...link, ...patch } : link) }
            : column
        )
      }
    });
  }

  function addFooterColumn() {
    setData({
      ...data,
      footer: {
        ...data.footer,
        footerColumns: [
          ...data.footer.footerColumns,
          {
            enabled: true,
            id: `footer-column-${Date.now()}`,
            links: [],
            title: "New column"
          }
        ]
      }
    });
  }

  function addFooterLink(columnId: string) {
    setData({
      ...data,
      footer: {
        ...data.footer,
        footerColumns: data.footer.footerColumns.map((column) =>
          column.id === columnId
            ? {
                ...column,
                links: [
                  ...column.links,
                  {
                    id: `footer-link-${Date.now()}`,
                    label: "New link",
                    url: "/products"
                  }
                ]
              }
            : column
        )
      }
    });
  }

  function deleteFooterColumn(columnId: string) {
    if (!window.confirm("Delete this footer column?")) return;

    setData({
      ...data,
      footer: {
        ...data.footer,
        footerColumns: data.footer.footerColumns.filter((column) => column.id !== columnId)
      }
    });
  }

  function deleteFooterLink(columnId: string, linkId: string) {
    setData({
      ...data,
      footer: {
        ...data.footer,
        footerColumns: data.footer.footerColumns.map((column) =>
          column.id === columnId ? { ...column, links: column.links.filter((link) => link.id !== linkId) } : column
        )
      }
    });
  }

  return (
    <AdminCard title="Footer builder">
      <div className="grid gap-4 md:grid-cols-2">
        <Input label="Contact phone" onChange={(event) => setData({ ...data, footer: { ...data.footer, contactPhone: event.target.value } })} value={data.footer.contactPhone} />
        <Input label="Contact email" onChange={(event) => setData({ ...data, footer: { ...data.footer, contactEmail: event.target.value } })} value={data.footer.contactEmail} />
        <Input label="Newsletter text" onChange={(event) => setData({ ...data, footer: { ...data.footer, newsletterText: event.target.value } })} value={data.footer.newsletterText} />
        <Input label="Copyright text" onChange={(event) => setData({ ...data, footer: { ...data.footer, copyrightText: event.target.value } })} value={data.footer.copyrightText} />
      </div>
      <div className="mt-6 rounded-md bg-mist p-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-black text-ink">Footer link editor</p>
          <button className="admin-action" onClick={addFooterColumn} type="button">
            <Plus className="h-4 w-4" /> Add column
          </button>
        </div>
        <div className="grid gap-4">
          {data.footer.footerColumns.map((column) => (
            <div className="rounded-md border border-black/10 bg-white p-4" key={column.id}>
              <div className="grid gap-4 md:grid-cols-[1fr_auto_auto] md:items-end">
                <Input label="Column title" onChange={(event) => updateFooterColumn(column.id, { title: event.target.value })} value={column.title} />
                <label className="flex items-center gap-2 rounded-md border border-black/10 p-3 text-sm font-bold text-ink">
                  <input checked={column.enabled} onChange={(event) => updateFooterColumn(column.id, { enabled: event.target.checked })} type="checkbox" />
                  Enabled
                </label>
                <button className="admin-action text-coral" onClick={() => deleteFooterColumn(column.id)} type="button">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <div className="mt-4 grid gap-3">
                {column.links.map((link) => (
                  <div className="grid gap-3 rounded-md bg-mist p-3 md:grid-cols-[1fr_1fr_auto] md:items-end" key={link.id}>
                    <Input label="Link label" onChange={(event) => updateFooterLink(column.id, link.id, { label: event.target.value })} value={link.label} />
                    <Input label="Link URL" onChange={(event) => updateFooterLink(column.id, link.id, { url: event.target.value })} value={link.url} />
                    <button className="admin-action text-coral" onClick={() => deleteFooterLink(column.id, link.id)} type="button">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button className="admin-action w-fit" onClick={() => addFooterLink(column.id)} type="button">
                  <Plus className="h-4 w-4" /> Add link
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-4 text-sm text-slate">Payment icons: {data.footer.paymentIcons.join(", ")}</p>
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
              <ImageUrlField
                label="Desktop image"
                onChange={(value) =>
                  setData({ ...data, banners: data.banners.map((entry) => entry.id === banner.id ? { ...entry, desktopImageUrl: value } : entry) })
                }
                value={banner.desktopImageUrl}
              />
              <ImageUrlField
                label="Mobile image"
                onChange={(value) =>
                  setData({ ...data, banners: data.banners.map((entry) => entry.id === banner.id ? { ...entry, mobileImageUrl: value } : entry) })
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
  function addLandingPage() {
    setData({
      ...data,
      landingPages: [
        ...data.landingPages,
        {
          id: `landing-page-${Date.now()}`,
          sections: [],
          seoDescription: "Edit this landing page SEO description.",
          seoTitle: "New Landing Page",
          slug: `landing-page-${data.landingPages.length + 1}`,
          status: "draft",
          title: "New Landing Page"
        }
      ]
    });
  }

  function deleteLandingPage(pageId: string) {
    if (!window.confirm("Delete this landing page from the draft?")) return;

    setData({
      ...data,
      landingPages: data.landingPages.filter((page) => page.id !== pageId)
    });
  }

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

  function deleteLandingSection(pageId: string, sectionId: string) {
    setData({
      ...data,
      landingPages: data.landingPages.map((entry) =>
        entry.id === pageId
          ? { ...entry, sections: entry.sections.filter((section) => section.id !== sectionId) }
          : entry
      )
    });
  }

  return (
    <AdminCard title="Landing page builder">
      <div className="mb-4 flex justify-end">
        <button className="admin-action" onClick={addLandingPage} type="button">
          <Plus className="h-4 w-4" /> Add landing page
        </button>
      </div>
      <div className="grid gap-5">
        {data.landingPages.map((page) => (
          <div className="rounded-md border border-black/10 p-4" key={page.id}>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 font-black text-ink"><LayoutTemplate className="h-4 w-4" /> {page.title}</div>
              <button className="admin-action text-coral" onClick={() => deleteLandingPage(page.id)} type="button">
                <Trash2 className="h-4 w-4" /> Delete page
              </button>
            </div>
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
                    <div className="mb-4 flex justify-end">
                      <button className="admin-action text-coral" onClick={() => deleteLandingSection(page.id, section.id)} type="button">
                        <Trash2 className="h-4 w-4" /> Delete section
                      </button>
                    </div>
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
                      <ImageUrlField
                        label="Photo / banner image"
                        onChange={(value) => updateLandingSection(page.id, section.id, { desktopImageUrl: value })}
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
              <ImageUrlField
                label="Featured image"
                onChange={(value) =>
                  setData({ ...data, blogPosts: data.blogPosts.map((entry) => entry.id === post.id ? { ...entry, featuredImageUrl: value } : entry) })
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
        <Input label="Canonical URL" onChange={(event) => setData({ ...data, seo: [{ ...homeSeo, canonicalUrl: event.target.value }, ...data.seo.slice(1)] })} value={homeSeo.canonicalUrl ?? ""} />
        <ImageUrlField label="Open Graph image" onChange={(value) => setData({ ...data, seo: [{ ...homeSeo, ogImageUrl: value }, ...data.seo.slice(1)] })} value={homeSeo.ogImageUrl ?? ""} />
      </div>
      <label className="mt-4 flex items-center gap-2 rounded-md border border-black/10 p-3 text-sm font-bold text-ink">
        <input checked={homeSeo.noindex} onChange={(event) => setData({ ...data, seo: [{ ...homeSeo, noindex: event.target.checked }, ...data.seo.slice(1)] })} type="checkbox" />
        Noindex this page
      </label>
      <p className="mt-4 text-sm text-slate">Structured data: {homeSeo.structuredDataPlaceholder}</p>
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
      <button className="admin-action mt-4" type="button"><Globe className="h-4 w-4" /> Restore selected version</button>
    </AdminCard>
  );
}

function StudioCommandCenter({
  health,
  previewMode,
  publish,
  saveDraft,
  setPreviewMode
}: {
  health: StudioHealth;
  previewMode: boolean;
  publish: () => void;
  saveDraft: () => void;
  setPreviewMode: (updater: (value: boolean) => boolean) => void;
}) {
  return (
    <section className="overflow-hidden rounded-card border border-black/10 bg-ink text-white shadow-card">
      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-xs font-black uppercase text-lime">
            <Sparkles className="h-4 w-4" /> Website editor command center
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <StudioMetric dark icon={Layers3} label="Sections" value={health.totalSections} />
            <StudioMetric dark icon={CheckCircle2} label="Published" value={health.publishedSections} />
            <StudioMetric dark icon={Clock} label="Scheduled" value={health.scheduledSections} />
            <StudioMetric dark icon={Target} label="Campaigns" value={health.activeBanners} />
            <StudioMetric dark icon={BarChart3} label="Readiness" value={`${health.score}%`} />
          </div>
        </div>
        <div className="rounded-md border border-white/15 bg-white/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-black">Publishing actions</p>
              <p className="mt-1 text-xs leading-5 text-white/70">{health.warnings.length ? `${health.warnings.length} item needs attention` : "Everything important looks ready"}</p>
            </div>
            <Badge tone={health.score >= 85 ? "success" : "sale"}>{health.score}%</Badge>
          </div>
          <div className="mt-4 grid gap-2">
            <button className="admin-action justify-center bg-white text-ink" onClick={saveDraft} type="button">
              <Save className="h-4 w-4" /> Save draft
            </button>
            <button className="admin-action justify-center bg-lime text-ink" onClick={publish} type="button">
              <Send className="h-4 w-4" /> Publish
            </button>
            <button className="admin-action justify-center border-white/20 bg-transparent text-white" onClick={() => setPreviewMode((value) => !value)} type="button">
              <Eye className="h-4 w-4" /> {previewMode ? "Exit preview" : "Preview mode"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StudioTabs({
  activeTab,
  health,
  setActiveTab
}: {
  activeTab: StudioTab;
  health: StudioHealth;
  setActiveTab: (tab: StudioTab) => void;
}) {
  const tabCounts: Partial<Record<StudioTab, number>> = {
    Banners: health.activeBanners,
    Blog: health.blogPosts,
    Footer: health.footerLinks,
    Header: health.menuLinks,
    Homepage: health.totalSections,
    "Landing Pages": health.landingPages,
    Policies: health.policies,
    SEO: health.seoPages,
    Specifics: health.warnings.length,
    Versions: health.versionCount
  };

  return (
    <div className="overflow-x-auto rounded-card border border-black/10 bg-white p-2 shadow-sm">
      <div className="flex min-w-max gap-2">
        {tabs.map((tab) => {
          const active = activeTab === tab;
          const count = tabCounts[tab];

          return (
            <button
              className={`inline-flex h-11 items-center gap-2 rounded-md px-4 text-sm font-black transition ${
                active ? "bg-ink text-white shadow-sm" : "text-slate hover:bg-mist hover:text-ink"
              }`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
              {typeof count === "number" ? (
                <span className={`rounded-md px-2 py-0.5 text-[11px] ${active ? "bg-white/15 text-white" : "bg-mist text-slate"}`}>{count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ContentHealthCard({ health }: { health: StudioHealth }) {
  return (
    <AdminCard action={<Badge tone={health.score >= 85 ? "success" : "sale"}>{health.score}% ready</Badge>} title="Content health">
      <div className="grid gap-3">
        {health.checks.map((check) => (
          <div className="flex items-start gap-3 rounded-md border border-black/10 bg-mist p-3" key={check.label}>
            <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${check.ok ? "bg-mint text-forest" : "bg-coral/10 text-coral"}`}>
              {check.ok ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            </div>
            <div>
              <p className="text-sm font-black text-ink">{check.label}</p>
              <p className="mt-1 text-xs leading-5 text-slate">{check.detail}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-2 rounded-md bg-ink px-3 py-2 text-xs font-black text-white">
        <ListChecks className="h-4 w-4" />
        {health.warnings.length ? `${health.warnings.length} checklist item open` : "Ready for owner review"}
      </div>
    </AdminCard>
  );
}

function PreviewViewportControls({
  previewViewport,
  setPreviewViewport
}: {
  previewViewport: "desktop" | "mobile";
  setPreviewViewport: (viewport: "desktop" | "mobile") => void;
}) {
  return (
    <div className="inline-flex rounded-md border border-black/10 bg-mist p-1">
      {(["desktop", "mobile"] as const).map((viewport) => (
        <button
          aria-label={`${label(viewport)} preview`}
          className={`grid h-8 w-9 place-items-center rounded-md ${previewViewport === viewport ? "bg-ink text-white" : "text-slate"}`}
          key={viewport}
          onClick={() => setPreviewViewport(viewport)}
          type="button"
        >
          {viewport === "desktop" ? <PanelTop className="h-4 w-4" /> : <MonitorSmartphone className="h-4 w-4" />}
        </button>
      ))}
    </div>
  );
}

function StudioMetric({
  dark = false,
  icon: Icon,
  label: metricLabel,
  value
}: {
  dark?: boolean;
  icon: typeof BarChart3;
  label: string;
  value: number | string;
}) {
  return (
    <div className={`rounded-md border p-4 ${dark ? "border-white/15 bg-white/10" : "border-black/10 bg-mist"}`}>
      <div className={`grid h-9 w-9 place-items-center rounded-md ${dark ? "bg-white text-ink" : "bg-ink text-white"}`}>
        <Icon className="h-4 w-4" />
      </div>
      <p className={`mt-4 text-2xl font-black ${dark ? "text-white" : "text-ink"}`}>{value}</p>
      <p className={`mt-1 text-xs font-bold uppercase ${dark ? "text-white/70" : "text-slate"}`}>{metricLabel}</p>
    </div>
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

function ImageUrlField(props: { label: string; onChange: (value: string) => void; value: string }) {
  return <ImageUploadField {...props} />;
}

function buildStudioHealth(data: WebsiteStudioData) {
  const totalSections = data.homepageSections.length;
  const enabledSections = data.homepageSections.filter((section) => section.enabled).length;
  const publishedSections = data.homepageSections.filter((section) => section.status === "published").length;
  const scheduledSections = data.homepageSections.filter((section) => Boolean(section.publishAt)).length;
  const missingTitles = data.homepageSections.filter((section) => !section.title.trim());
  const sectionsMissingImage = data.homepageSections.filter(sectionNeedsImage);
  const sectionsMissingMobileImage = data.homepageSections.filter(sectionNeedsMobileImage);
  const sectionsNeedingCta = data.homepageSections.filter(sectionNeedsCta);
  const sectionsNotPublished = data.homepageSections.filter((section) => section.enabled && section.status !== "published");
  const seoMissingCopy = data.seo.filter((entry) => !entry.title.trim() || !entry.metaDescription.trim());
  const seoNoindex = data.seo.filter((entry) => entry.noindex);
  const activeBanners = data.banners.filter((banner) => banner.active).length;
  const menuLinks = data.header.megaMenuItems.reduce((total, item) => total + 1 + (item.children?.length ?? 0), 0);
  const footerLinks = data.footer.footerColumns.reduce((total, column) => total + column.links.length, 0);

  const checks = [
    {
      detail: missingTitles.length ? `${missingTitles.length} section title missing` : "Every homepage section has a title",
      label: "Homepage titles",
      ok: missingTitles.length === 0
    },
    {
      detail: sectionsMissingImage.length ? `${sectionsMissingImage.length} visual section needs a desktop image` : "Hero and image sections have desktop images",
      label: "Visual assets",
      ok: sectionsMissingImage.length === 0
    },
    {
      detail: sectionsMissingMobileImage.length ? `${sectionsMissingMobileImage.length} visual section needs a mobile image` : "Hero and image sections have mobile images",
      label: "Mobile assets",
      ok: sectionsMissingMobileImage.length === 0
    },
    {
      detail: sectionsNeedingCta.length ? `${sectionsNeedingCta.length} conversion section needs CTA text or link` : "Conversion sections have CTA text and links",
      label: "CTA coverage",
      ok: sectionsNeedingCta.length === 0
    },
    {
      detail: sectionsNotPublished.length ? `${sectionsNotPublished.length} visible section needs publish status` : "Visible sections are marked published",
      label: "Publish readiness",
      ok: sectionsNotPublished.length === 0
    },
    {
      detail: seoMissingCopy.length ? `${seoMissingCopy.length} SEO page needs title or meta description` : "SEO title and meta copy are ready",
      label: "SEO copy",
      ok: seoMissingCopy.length === 0
    },
    {
      detail: menuLinks ? `${menuLinks} menu links configured` : "Add at least one header navigation link",
      label: "Navigation",
      ok: menuLinks > 0
    },
    {
      detail: footerLinks ? `${footerLinks} footer links configured` : "Add footer links before launch",
      label: "Footer trust links",
      ok: footerLinks > 0
    },
    {
      detail: activeBanners ? `${activeBanners} active campaign banner${activeBanners === 1 ? "" : "s"}` : "Activate at least one banner when a campaign is live",
      label: "Campaign banners",
      ok: activeBanners > 0
    }
  ];
  const warnings = checks.filter((check) => !check.ok);
  const score = Math.round((checks.filter((check) => check.ok).length / checks.length) * 100);

  return {
    activeBanners,
    blogPosts: data.blogPosts.length,
    checks,
    enabledSections,
    footerLinks,
    landingPages: data.landingPages.length,
    menuLinks,
    policies: data.policies.length,
    publishedSections,
    scheduledSections,
    score,
    seoNoindex,
    seoPages: data.seo.length,
    totalSections,
    versionCount: data.versionHistory.length,
    warnings
  };
}

function sectionNeedsCta(section: HomepageSection) {
  return (
    ["hero_banner", "image_banner", "flash_sale", "product_carousel", "collection_carousel", "newsletter"].includes(section.type) &&
    (!section.ctaLabel?.trim() || !section.ctaLink?.trim())
  );
}

function sectionNeedsImage(section: HomepageSection) {
  return ["hero_banner", "image_banner"].includes(section.type) && !section.desktopImageUrl?.trim();
}

function sectionNeedsMobileImage(section: HomepageSection) {
  return ["hero_banner", "image_banner"].includes(section.type) && !section.mobileImageUrl?.trim();
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (letter) => letter.toUpperCase());
}
