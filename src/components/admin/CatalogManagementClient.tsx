"use client";

import Image from "next/image";
import { AlertTriangle, Download, FileUp, Plus, Save, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { brands } from "@/mock/brands";
import { categories } from "@/mock/categories";
import { storefrontProducts } from "@/mock/storefront";
import type { AdminSession } from "@/types/admin";
import type { ProductStatus } from "@/types";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { showDemoData } from "@/lib/admin/liveData";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import { scanClaimText } from "@/lib/compliance/complianceService";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";
import { ImageUploadButton, ImageUploadField } from "./ImageUploadField";

type AdminProductStatus = ProductStatus | "inactive";

type EditableVariant = {
  barcode: string;
  costPrice: number;
  discountPercent: number;
  flavor: string;
  isSubscriptionEligible: boolean;
  mrp: number;
  sellingPrice: number;
  size: string;
  sku: string;
  stockTrackingEnabled: boolean;
  weightInGrams: number;
};

type EditableProduct = {
  allergenInfo: string;
  brandId: string;
  categoryId: string;
  collections: string[];
  description: string;
  fssaiLicense: string;
  manufacturerName: string;
  marketerImporterName: string;
  goals: string;
  ingredients: string;
  keyHighlights: string;
  labReportUrl: string;
  labelImages: string;
  nutritionLabelImage: string;
  name: string;
  nutritionFacts: string;
  productImages: string;
  relatedProducts: string;
  seoDescription: string;
  seoTitle: string;
  shortDescription: string;
  slug: string;
  status: AdminProductStatus;
  complianceStatus: "pending" | "approved" | "rejected" | "needs_update";
  storageInstructions: string;
  usageInstructions: string;
  variants: EditableVariant[];
  warningDisclaimer: string;
  productClaims: string;
};

const tabs = ["Basic Info", "Media", "Nutrition", "Variants", "SEO", "Compliance", "Related Products"] as const;
type ProductFormTab = (typeof tabs)[number];

const initialProduct: EditableProduct = {
  allergenInfo: "Milk, Soy",
  brandId: brands[0]?.id ?? "",
  categoryId: categories[0]?.id ?? "",
  collections: ["best-sellers"],
  description: "Premium supplement description for admin editing.",
  fssaiLicense: "",
  manufacturerName: "Fit Manufacturing Labs Pvt Ltd",
  marketerImporterName: "FitSupplement Store",
  goals: "Muscle support, Post-workout",
  ingredients: "Whey protein concentrate, Cocoa powder, Digestive enzymes",
  keyHighlights: "25 g protein per serving, Verified batch, Lab report ready",
  labReportUrl: "/assets/reports/whey-elite-lab-report.pdf",
  labelImages: "/assets/labels/whey-elite-label.png",
  nutritionLabelImage: "/assets/labels/whey-elite-nutrition.png",
  name: "NutraForge Whey Elite",
  nutritionFacts: "Protein: 25 g\nSugar: 1.2 g\nBCAA: 5.5 g",
  productImages: "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f",
  relatedProducts: "Creatine, Shaker, Multivitamin",
  seoDescription: "Premium whey protein powder with clear nutrition and lab-report details.",
  seoTitle: "NutraForge Whey Elite Protein Powder",
  shortDescription: "Fast-mixing whey protein with digestive enzyme support.",
  slug: "nutraforge-whey-elite",
  status: "active",
  complianceStatus: "pending",
  storageInstructions: "Store in a cool, dry place away from sunlight.",
  usageInstructions: "Mix one scoop with water or milk.",
  variants: [
    {
      barcode: "890000000001",
      costPrice: 2100,
      discountPercent: 14,
      flavor: "Double Chocolate",
      isSubscriptionEligible: true,
      mrp: 3499,
      sellingPrice: 2999,
      size: "1 kg",
      sku: "NF-WHEY-CHOCO-1KG",
      stockTrackingEnabled: true,
      weightInGrams: 1000
    }
  ],
  warningDisclaimer:
    "This product is not intended to diagnose, treat, cure, or prevent any disease. Not for medicinal use.",
  productClaims: "Supports daily protein intake and post-workout nutrition routines."
};

export function CatalogManagementClient() {
  if (!showDemoData) {
    return <LiveCatalogManagementClient />;
  }

  return <DemoCatalogManagementClient />;
}

type LiveProductForm = {
  allergens: string;
  brandName: string;
  categoryName: string;
  description: string;
  goalTags: string;
  imageUrl: string;
  ingredients: string;
  mrp: number;
  name: string;
  sellingPrice: number;
  shortDescription: string;
  size: string;
  sku: string;
  slug: string;
  status: "DRAFT" | "ACTIVE";
  stock: number;
  usageInstructions: string;
  warningText: string;
  weightInGrams: number;
};

const liveInitialProduct: LiveProductForm = {
  allergens: "",
  brandName: "",
  categoryName: "",
  description: "",
  goalTags: "",
  imageUrl: "",
  ingredients: "",
  mrp: 0,
  name: "",
  sellingPrice: 0,
  shortDescription: "",
  size: "",
  sku: "",
  slug: "",
  status: "DRAFT",
  stock: 0,
  usageInstructions: "",
  warningText: "This product is not intended to diagnose, treat, cure, or prevent any disease. Not for medicinal use.",
  weightInGrams: 100
};

const liveProductTemplates: Array<{ label: string; value: LiveProductForm }> = [
  {
    label: "Whey protein powder",
    value: {
      allergens: "Milk, Soy",
      brandName: "NutraForge",
      categoryName: "Protein Powders",
      description: "Premium whey protein powder for daily protein intake and post-workout nutrition routines.",
      goalTags: "Muscle support, Post-workout, Protein",
      imageUrl: "",
      ingredients: "Whey protein concentrate, Cocoa powder, Digestive enzymes, Sweetener",
      mrp: 3499,
      name: "Whey Protein Powder",
      sellingPrice: 2999,
      shortDescription: "Fast-mixing whey protein with clear nutrition and batch details.",
      size: "1 kg",
      sku: "WHEY-1KG",
      slug: "whey-protein-powder",
      status: "DRAFT",
      stock: 0,
      usageInstructions: "Mix one scoop with 180-220 ml water or milk after training or as needed.",
      warningText: liveInitialProduct.warningText,
      weightInGrams: 1000
    }
  },
  {
    label: "Creatine monohydrate",
    value: {
      allergens: "None declared",
      brandName: "NutraForge",
      categoryName: "Performance",
      description: "Single-ingredient creatine monohydrate for strength training routines and everyday performance support.",
      goalTags: "Strength, Performance, Training",
      imageUrl: "",
      ingredients: "Creatine monohydrate",
      mrp: 1499,
      name: "Creatine Monohydrate",
      sellingPrice: 1099,
      shortDescription: "Micronized unflavoured creatine monohydrate.",
      size: "250 g",
      sku: "CRTN-250G",
      slug: "creatine-monohydrate",
      status: "DRAFT",
      stock: 0,
      usageInstructions: "Mix 3 g with water once daily. Use consistently as part of a training routine.",
      warningText: liveInitialProduct.warningText,
      weightInGrams: 250
    }
  },
  {
    label: "Mass gainer",
    value: {
      allergens: "Milk, Soy",
      brandName: "PureLift",
      categoryName: "Protein Powders",
      description: "Calorie-dense mass gainer with protein, carbohydrates, and vitamins for structured bulking plans.",
      goalTags: "Weight gain, Bulking, Calories",
      imageUrl: "",
      ingredients: "Maltodextrin, Whey protein, MCT powder, Vitamin blend",
      mrp: 4299,
      name: "Mass Gainer",
      sellingPrice: 3699,
      shortDescription: "High-calorie nutrition support for bulking phases.",
      size: "3 kg",
      sku: "GAIN-3KG",
      slug: "mass-gainer",
      status: "DRAFT",
      stock: 0,
      usageInstructions: "Mix two scoops with 350 ml milk or water between meals.",
      warningText: liveInitialProduct.warningText,
      weightInGrams: 3000
    }
  },
  {
    label: "Daily multivitamin",
    value: {
      allergens: "None declared",
      brandName: "VitalStack",
      categoryName: "Vitamins & Wellness",
      description: "Daily multivitamin tablets with essential vitamins and minerals for active lifestyles.",
      goalTags: "Daily wellness, Vitamins, Health support",
      imageUrl: "",
      ingredients: "Vitamin blend, Mineral blend, Tablet excipients",
      mrp: 899,
      name: "Daily Multivitamin",
      sellingPrice: 699,
      shortDescription: "Everyday multivitamin support for active routines.",
      size: "60 tablets",
      sku: "MULTI-60TAB",
      slug: "daily-multivitamin",
      status: "DRAFT",
      stock: 0,
      usageInstructions: "Take one tablet daily with a meal or as directed on the product label.",
      warningText: liveInitialProduct.warningText,
      weightInGrams: 120
    }
  }
];

const brandPresets = ["NutraForge", "PureLift", "VitalStack", "FitSupplement", "Optimum Nutrition", "MuscleBlaze", "GNC"];
const categoryPresets = ["Protein Powders", "Performance", "Vitamins & Wellness", "Mass Gainers", "Fitness Accessories", "Weight Management"];
const sizePresets = ["250 g", "500 g", "1 kg", "2 kg", "3 kg", "30 servings", "60 tablets", "90 tablets", "Shaker"];
const goalPresets = [
  "Muscle support, Post-workout, Protein",
  "Strength, Performance, Training",
  "Weight gain, Bulking, Calories",
  "Daily wellness, Vitamins, Health support",
  "Fat loss, Low sugar, Lean routine"
];
const ingredientPresets = [
  "Whey protein concentrate, Cocoa powder, Digestive enzymes, Sweetener",
  "Creatine monohydrate",
  "Maltodextrin, Whey protein, MCT powder, Vitamin blend",
  "Vitamin blend, Mineral blend, Tablet excipients",
  "Plant protein blend, Natural flavour, Sweetener"
];
const allergenPresets = ["None declared", "Milk", "Milk, Soy", "Soy", "Peanuts, Tree nuts", "Gluten"];
const usagePresets = [
  "Mix one scoop with 180-220 ml water or milk after training or as needed.",
  "Mix 3 g with water once daily. Use consistently as part of a training routine.",
  "Mix two scoops with 350 ml milk or water between meals.",
  "Take one tablet daily with a meal or as directed on the product label.",
  "Use as directed on the product label."
];

function LiveCatalogManagementClient() {
  const { session } = useAdminSession();
  const [form, setForm] = useState<LiveProductForm>(liveInitialProduct);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const missingRequiredFields = useMemo(() => getMissingLiveProductFields(form), [form]);
  const canSaveProduct = missingRequiredFields.length === 0 && !isSaving;

  function updateForm<K extends keyof LiveProductForm>(key: K, value: LiveProductForm[K]) {
    setForm((current) => ({
      ...current,
      [key]: value,
      ...(key === "name" && !current.slug ? { slug: slugFromName(String(value)) } : {})
    }));
    setError("");
  }

  function applyTemplate(templateLabel: string) {
    const template = liveProductTemplates.find((item) => item.label === templateLabel);

    if (!template) {
      setSelectedTemplate("");
      return;
    }

    const skuSuffix = Date.now().toString().slice(-5);
    setSelectedTemplate(templateLabel);
    setForm({
      ...template.value,
      sku: `${template.value.sku}-${skuSuffix}`
    });
    setError("");
    setMessage(`${template.label} template selected. Review price and stock, then add product.`);
  }

  async function saveProduct() {
    if (missingRequiredFields.length > 0) {
      setError(`Complete required fields before saving: ${missingRequiredFields.join(", ")}.`);
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/products", {
        body: JSON.stringify(form),
        headers: { "Content-Type": "application/json" },
        method: "POST"
      });
      const result = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setError(result.message ?? "Unable to create product.");
        return;
      }

      writeAdminAuditLog(session, {
        action: "admin.product.create",
        entityId: form.slug,
        entityType: "Product",
        metadata: { sku: form.sku, status: form.status }
      });
      setMessage(result.message ?? "Product created successfully.");
      setForm(liveInitialProduct);
      setSelectedTemplate("");
    } catch {
      setError("Unable to connect to catalog API.");
    } finally {
      setIsSaving(false);
    }
  }

  function resetForm() {
    setForm(liveInitialProduct);
    setSelectedTemplate("");
    setError("");
    setMessage("");
  }

  return (
    <div className="grid gap-6">
      <AdminCard
        action={<Badge tone="success">MongoDB live catalog</Badge>}
        description="Add production products directly to the live catalog. Use a template, review the fields, then publish when ready."
        title="Add product"
      >
        <div className="mb-5 grid gap-4 rounded-md border border-black/10 bg-mist p-4 md:grid-cols-2 xl:grid-cols-4">
          <SelectField label="Product template" onChange={applyTemplate} value={selectedTemplate}>
            <option value="">Select product type</option>
            {liveProductTemplates.map((template) => (
              <option key={template.label} value={template.label}>{template.label}</option>
            ))}
          </SelectField>
          <SelectField label="Brand" onChange={(value) => updateForm("brandName", value)} value={form.brandName}>
            <option value="">Select brand</option>
            {brandPresets.map((brand) => <option key={brand} value={brand}>{brand}</option>)}
          </SelectField>
          <SelectField label="Category" onChange={(value) => updateForm("categoryName", value)} value={form.categoryName}>
            <option value="">Select category</option>
            {categoryPresets.map((category) => <option key={category} value={category}>{category}</option>)}
          </SelectField>
          <SelectField label="Size" onChange={(value) => updateForm("size", value)} value={form.size}>
            <option value="">Select size</option>
            {sizePresets.map((size) => <option key={size} value={size}>{size}</option>)}
          </SelectField>
          <SelectField label="Goal tags" onChange={(value) => updateForm("goalTags", value)} value={form.goalTags}>
            <option value="">Select goal group</option>
            {goalPresets.map((goal) => <option key={goal} value={goal}>{goal}</option>)}
          </SelectField>
          <SelectField label="Ingredients" onChange={(value) => updateForm("ingredients", value)} value={form.ingredients}>
            <option value="">Select ingredients</option>
            {ingredientPresets.map((ingredient) => <option key={ingredient} value={ingredient}>{ingredient}</option>)}
          </SelectField>
          <SelectField label="Allergens" onChange={(value) => updateForm("allergens", value)} value={form.allergens}>
            <option value="">Select allergens</option>
            {allergenPresets.map((allergen) => <option key={allergen} value={allergen}>{allergen}</option>)}
          </SelectField>
          <SelectField label="Usage instructions" onChange={(value) => updateForm("usageInstructions", value)} value={form.usageInstructions}>
            <option value="">Select usage</option>
            {usagePresets.map((usage) => <option key={usage} value={usage}>{usage}</option>)}
          </SelectField>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Input label="Product name" onChange={(event) => updateForm("name", event.target.value)} required value={form.name} />
          <Input helperText="Lowercase letters, numbers, and hyphens only." label="Slug" onChange={(event) => updateForm("slug", slugFromName(event.target.value))} required value={form.slug} />
          <Input label="SKU" onChange={(event) => updateForm("sku", event.target.value)} required value={form.sku} />
          <Input label="MRP" min={1} onChange={(event) => updateForm("mrp", Number(event.target.value))} required type="number" value={form.mrp} />
          <Input label="Selling price" min={1} onChange={(event) => updateForm("sellingPrice", Number(event.target.value))} required type="number" value={form.sellingPrice} />
          <Input label="Opening stock" min={0} onChange={(event) => updateForm("stock", Number(event.target.value))} type="number" value={form.stock} />
          <Input label="Weight in grams" min={1} onChange={(event) => updateForm("weightInGrams", Number(event.target.value))} required type="number" value={form.weightInGrams} />
          <SelectField label="Status" onChange={(value) => updateForm("status", value as LiveProductForm["status"])} value={form.status}>
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
          </SelectField>
          <div className="md:col-span-2">
            <ImageUploadField helperText="Optional, but recommended before publishing active products." label="Product image" onChange={(value) => updateForm("imageUrl", value)} value={form.imageUrl} />
          </div>
          <Input className="md:col-span-2" label="Short description" onChange={(event) => updateForm("shortDescription", event.target.value)} required value={form.shortDescription} />
          <Textarea label="Description" onChange={(value) => updateForm("description", value)} value={form.description} />
          <Textarea label="Ingredients" onChange={(value) => updateForm("ingredients", value)} value={form.ingredients} />
          <Textarea label="Allergens" onChange={(value) => updateForm("allergens", value)} value={form.allergens} />
          <Textarea label="Goal tags" onChange={(value) => updateForm("goalTags", value)} value={form.goalTags} />
          <Textarea label="Usage instructions" onChange={(value) => updateForm("usageInstructions", value)} value={form.usageInstructions} />
          <Textarea label="Warning text" onChange={(value) => updateForm("warningText", value)} value={form.warningText} />
        </div>
        {missingRequiredFields.length > 0 ? (
          <p className="mt-4 rounded-md border border-black/10 bg-white p-3 text-sm font-semibold text-slate">
            Required before saving: {missingRequiredFields.join(", ")}.
          </p>
        ) : null}
        {error ? <p className="mt-4 rounded-md bg-coral/10 p-3 text-sm font-bold text-coral" role="alert">{error}</p> : null}
        {message ? <p className="mt-4 rounded-md bg-mint p-3 text-sm font-bold text-forest" role="status">{message}</p> : null}
        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button className="admin-action" onClick={resetForm} type="button">
            Reset
          </button>
          <button className="admin-action bg-ink text-white disabled:cursor-not-allowed disabled:opacity-60" disabled={!canSaveProduct} onClick={saveProduct} type="button">
            <Plus className="h-4 w-4" /> {isSaving ? "Saving..." : "Add product"}
          </button>
        </div>
      </AdminCard>
    </div>
  );
}

function DemoCatalogManagementClient() {
  const { session } = useAdminSession();
  const [activeTab, setActiveTab] = useState<ProductFormTab>("Basic Info");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [productStatuses, setProductStatuses] = useState<Record<string, AdminProductStatus>>({});
  const [form, setForm] = useState<EditableProduct>(initialProduct);
  const [toast, setToast] = useState("");
  const [confirmMessage, setConfirmMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const totalStockByProductId = useMemo(
    () =>
      Object.fromEntries(
        storefrontProducts.map((product) => [
          product.id,
          product.variants.reduce((total, variant) => total + variant.stock, 0)
        ])
      ),
    []
  );

  function updateForm<K extends keyof EditableProduct>(key: K, value: EditableProduct[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  }

  function updateVariant(index: number, value: Partial<EditableVariant>) {
    setForm((current) => ({
      ...current,
      variants: current.variants.map((variant, variantIndex) =>
        variantIndex === index ? { ...variant, ...value } : variant
      )
    }));
  }

  function addVariant() {
    setForm((current) => ({
      ...current,
      variants: [
        ...current.variants,
        {
          barcode: "",
          costPrice: 0,
          discountPercent: 0,
          flavor: "",
          isSubscriptionEligible: false,
          mrp: 0,
          sellingPrice: 0,
          size: "",
          sku: "",
          stockTrackingEnabled: true,
          weightInGrams: 0
        }
      ]
    }));
  }

  function removeVariant(index: number) {
    if (!window.confirm("Remove this variant from the draft form?")) {
      return;
    }

    setForm((current) => ({
      ...current,
      variants: current.variants.filter((_, variantIndex) => variantIndex !== index)
    }));
    audit(session, "admin.product.variant.remove", "ProductVariant", form.variants[index]?.sku);
    setToast("Variant removed from draft.");
  }

  function handleSaveProduct() {
    const nextErrors = validateProduct(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setToast("Fix required product fields before saving.");
      return;
    }

    audit(session, "admin.product.save", "Product", form.slug, {
      status: form.status,
      variantCount: form.variants.length
    });
    setToast("Product draft saved.");
  }

  function handleBulkAction(action: "activate" | "deactivate" | "change-category" | "export" | "import") {
    if (["activate", "deactivate", "change-category"].includes(action) && selectedProductIds.length === 0) {
      setToast("Select products before running this bulk action.");
      return;
    }

    if (action === "deactivate" && !window.confirm("Deactivate selected products?")) {
      return;
    }

    if (action === "activate" || action === "deactivate") {
      setProductStatuses((current) => ({
        ...current,
        ...Object.fromEntries(selectedProductIds.map((id) => [id, action === "activate" ? "active" : "inactive"]))
      }));
    }

    if (action === "change-category") {
      setConfirmMessage("Change category action queued.");
    }

    if (action === "export") {
      setConfirmMessage("CSV export queued.");
    }

    if (action === "import") {
      setConfirmMessage("CSV import action queued.");
    }

    audit(session, `admin.product.bulk.${action}`, "Product", selectedProductIds.join(","), {
      selectedCount: selectedProductIds.length
    });
    setToast(`Bulk action "${action}" completed.`);
  }

  function toggleSelected(productId: string) {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  }

  return (
    <div className="grid gap-6">
      {toast ? <Toast message={toast} onDismiss={() => setToast("")} /> : null}
      {confirmMessage ? (
        <div className="rounded-card border border-forest/30 bg-mint p-4 text-sm font-bold text-forest">
          {confirmMessage}
          <button className="ml-3 underline" onClick={() => setConfirmMessage("")} type="button">
            Dismiss
          </button>
        </div>
      ) : null}

      <AdminCard title="Product management">
        <div className="mb-4 flex flex-wrap gap-2">
          <button className="admin-action" onClick={() => handleBulkAction("activate")} type="button">Activate</button>
          <button className="admin-action" onClick={() => handleBulkAction("deactivate")} type="button">Deactivate</button>
          <button className="admin-action" onClick={() => handleBulkAction("change-category")} type="button">Change category</button>
          <button className="admin-action" onClick={() => handleBulkAction("export")} type="button"><Download className="h-4 w-4" /> Export CSV</button>
          <button className="admin-action" onClick={() => handleBulkAction("import")} type="button"><FileUp className="h-4 w-4" /> Import CSV</button>
        </div>
        <AdminTable
          columns={["", "Image", "Product", "Brand", "Category", "SKU count", "Stock", "Price", "Status", "Actions"]}
          rows={storefrontProducts.map((product) => {
            const primaryVariant = product.variants[0];
            const status = productStatuses[product.id] ?? product.status;
            return [
              <input checked={selectedProductIds.includes(product.id)} key="select" onChange={() => toggleSelected(product.id)} type="checkbox" />,
              product.images[0] ? (
                <Image alt={product.images[0].altText} className="h-12 w-12 rounded-md object-cover" height={80} key="image" src={product.images[0].url} width={80} />
              ) : null,
              <span className="font-black text-ink" key="name">{product.name}</span>,
              product.merchandising.brandName,
              categories.find((category) => product.categoryIds.includes(category.id))?.name ?? "Unmapped",
              product.variants.length,
              totalStockByProductId[product.id],
              primaryVariant ? `Rs ${primaryVariant.sellingPrice.toLocaleString("en-IN")}` : "-",
              <Badge key="status" tone={status === "active" ? "success" : "neutral"}>{status}</Badge>,
              <div className="flex gap-2" key="actions">
                <button className="rounded-md border border-black/10 px-2 py-1 text-xs font-black" onClick={() => loadProduct(product.id)} type="button">Edit</button>
                <button className="rounded-md border border-coral/30 px-2 py-1 text-xs font-black text-coral" onClick={() => confirmDeactivate(product.id)} type="button">Delete</button>
              </div>
            ];
          })}
        />
      </AdminCard>

      <AdminCard title="Product create/edit form">
        <div className="flex gap-2 overflow-x-auto border-b border-black/10 pb-3">
          {tabs.map((tab) => (
            <button
              className={`shrink-0 rounded-md px-3 py-2 text-sm font-black ${activeTab === tab ? "bg-ink text-white" : "bg-mist text-ink"}`}
              key={tab}
              onClick={() => setActiveTab(tab)}
              type="button"
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mt-5">
          {activeTab === "Basic Info" ? <BasicInfoTab errors={errors} form={form} updateForm={updateForm} /> : null}
          {activeTab === "Media" ? <MediaTab form={form} updateForm={updateForm} /> : null}
          {activeTab === "Nutrition" ? <NutritionTab form={form} updateForm={updateForm} /> : null}
          {activeTab === "Variants" ? <VariantsTab addVariant={addVariant} form={form} removeVariant={removeVariant} updateVariant={updateVariant} /> : null}
          {activeTab === "SEO" ? <SeoTab form={form} updateForm={updateForm} /> : null}
          {activeTab === "Compliance" ? <ComplianceTab form={form} updateForm={updateForm} /> : null}
          {activeTab === "Related Products" ? <RelatedTab form={form} updateForm={updateForm} /> : null}
        </div>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button className="focus-ring rounded-md border border-black/10 bg-white px-4 py-2 text-sm font-black" onClick={() => setForm(initialProduct)} type="button">
            Reset
          </button>
          <button className="focus-ring inline-flex items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-black text-white" onClick={handleSaveProduct} type="button">
            <Save className="h-4 w-4" /> Save product
          </button>
        </div>
      </AdminCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <CategoryManagement onAction={(action) => auditAndToast(session, action, "Category", setToast)} />
        <BrandManagement onAction={(action) => auditAndToast(session, action, "Brand", setToast)} />
      </div>
    </div>
  );

  function loadProduct(productId: string) {
    const product = storefrontProducts.find((candidate) => candidate.id === productId);

    if (!product) {
      return;
    }

    setForm({
      ...initialProduct,
      allergenInfo: product.allergens.join(", "),
      brandId: product.brandId,
      categoryId: product.categoryIds[0] ?? categories[0]?.id ?? "",
      collections: product.collectionIds,
      description: product.description,
      goals: product.goalTags.join(", "),
      ingredients: product.ingredients.join(", "),
      labReportUrl: product.labReportUrl ?? "",
      labelImages: product.labelImageUrls.join(", "),
      manufacturerName: initialProduct.manufacturerName,
      marketerImporterName: initialProduct.marketerImporterName,
      name: product.name,
      nutritionLabelImage: initialProduct.nutritionLabelImage,
      nutritionFacts: product.nutritionFacts.map((fact) => `${fact.name}: ${fact.amount}`).join("\n"),
      productImages: product.images.map((image) => image.url).join(", "),
      seoDescription: product.seoDescription ?? "",
      seoTitle: product.seoTitle ?? "",
      shortDescription: product.shortDescription,
      slug: product.slug,
      status: product.status,
      complianceStatus: initialProduct.complianceStatus,
      usageInstructions: product.usageInstructions,
      variants: product.variants.map((item) => ({
        barcode: "",
        costPrice: Math.round(item.sellingPrice * 0.65),
        discountPercent: item.discountPercent,
        flavor: item.flavor ?? "",
        isSubscriptionEligible: true,
        mrp: item.mrp,
        sellingPrice: item.sellingPrice,
        size: item.size ?? "",
        sku: item.sku,
        stockTrackingEnabled: true,
        weightInGrams: item.weightInGrams
      })),
      warningDisclaimer: product.warningText,
      productClaims: initialProduct.productClaims
    });
    setToast(`${product.name} loaded into editor.`);
  }

  function confirmDeactivate(productId: string) {
    if (!window.confirm("Delete/deactivate this product?")) {
      return;
    }

    setProductStatuses((current) => ({ ...current, [productId]: "inactive" }));
    audit(session, "admin.product.deactivate", "Product", productId);
    setToast("Product deactivated.");
  }
}

function BasicInfoTab({
  errors,
  form,
  updateForm
}: {
  errors: Record<string, string>;
  form: EditableProduct;
  updateForm: <K extends keyof EditableProduct>(key: K, value: EditableProduct[K]) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input error={errors.name} label="Product name" onChange={(event) => updateForm("name", event.target.value)} value={form.name} />
      <Input error={errors.slug} label="Slug" onChange={(event) => updateForm("slug", event.target.value)} value={form.slug} />
      <SelectField label="Brand" onChange={(value) => updateForm("brandId", value)} value={form.brandId}>
        {brands.map((brand) => <option key={brand.id} value={brand.id}>{brand.name}</option>)}
      </SelectField>
      <SelectField label="Category" onChange={(value) => updateForm("categoryId", value)} value={form.categoryId}>
        {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
      </SelectField>
      <Input label="Collections" onChange={(event) => updateForm("collections", event.target.value.split(",").map((item) => item.trim()))} value={form.collections.join(", ")} />
      <Input label="Goals" onChange={(event) => updateForm("goals", event.target.value)} value={form.goals} />
      <Input className="md:col-span-2" label="Short description" onChange={(event) => updateForm("shortDescription", event.target.value)} value={form.shortDescription} />
      <Textarea label="Description" onChange={(value) => updateForm("description", value)} value={form.description} />
      <Textarea label="Key highlights" onChange={(value) => updateForm("keyHighlights", value)} value={form.keyHighlights} />
      <SelectField label="Status" onChange={(value) => updateForm("status", value as AdminProductStatus)} value={form.status}>
        <option value="draft">Draft</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </SelectField>
    </div>
  );
}

function MediaTab({ form, updateForm }: ProductTabProps) {
  function appendImage(key: "productImages" | "labelImages", url: string) {
    const current = form[key].trim();
    updateForm(key, current ? `${current}, ${url}` : url);
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="grid gap-3 md:col-span-2">
        <Textarea label="Product images" onChange={(value) => updateForm("productImages", value)} value={form.productImages} />
        <ImageUploadButton label="Upload product image" onUploaded={(url) => appendImage("productImages", url)} />
      </div>
      <div className="grid gap-3 md:col-span-2">
        <Textarea label="Label images" onChange={(value) => updateForm("labelImages", value)} value={form.labelImages} />
        <ImageUploadButton label="Upload label image" onUploaded={(url) => appendImage("labelImages", url)} />
      </div>
      <Input label="Lab report URL" onChange={(event) => updateForm("labReportUrl", event.target.value)} value={form.labReportUrl} />
      <div className="rounded-md border border-dashed border-black/20 bg-mist p-4 text-sm font-semibold text-slate">
        Add product images, label images, and supporting documents before publishing.
      </div>
    </div>
  );
}

function NutritionTab({ form, updateForm }: ProductTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Textarea label="Nutrition facts" onChange={(value) => updateForm("nutritionFacts", value)} value={form.nutritionFacts} />
      <Textarea label="Ingredients" onChange={(value) => updateForm("ingredients", value)} value={form.ingredients} />
      <Textarea label="Allergen info" onChange={(value) => updateForm("allergenInfo", value)} value={form.allergenInfo} />
      <Textarea label="Usage instructions" onChange={(value) => updateForm("usageInstructions", value)} value={form.usageInstructions} />
    </div>
  );
}

function VariantsTab({
  addVariant,
  form,
  removeVariant,
  updateVariant
}: {
  addVariant: () => void;
  form: EditableProduct;
  removeVariant: (index: number) => void;
  updateVariant: (index: number, value: Partial<EditableVariant>) => void;
}) {
  return (
    <div className="grid gap-4">
      {form.variants.map((variant, index) => (
        <div className="rounded-card border border-black/10 bg-mist p-4" key={`${variant.sku}-${index}`}>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="font-black text-ink">Variant {index + 1}</h3>
            <button className="rounded-md border border-coral/30 px-3 py-2 text-xs font-black text-coral" onClick={() => removeVariant(index)} type="button">
              <Trash2 className="inline h-4 w-4" /> Remove
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            <Input label="SKU" onChange={(event) => updateVariant(index, { sku: event.target.value })} value={variant.sku} />
            <Input label="Flavor" onChange={(event) => updateVariant(index, { flavor: event.target.value })} value={variant.flavor} />
            <Input label="Size" onChange={(event) => updateVariant(index, { size: event.target.value })} value={variant.size} />
            <Input label="Weight (g)" onChange={(event) => updateVariant(index, { weightInGrams: Number(event.target.value) })} type="number" value={variant.weightInGrams} />
            <Input label="MRP" onChange={(event) => updateVariant(index, { mrp: Number(event.target.value) })} type="number" value={variant.mrp} />
            <Input label="Selling price" onChange={(event) => updateVariant(index, { sellingPrice: Number(event.target.value) })} type="number" value={variant.sellingPrice} />
            <Input label="Cost price" onChange={(event) => updateVariant(index, { costPrice: Number(event.target.value) })} type="number" value={variant.costPrice} />
            <Input label="Discount %" onChange={(event) => updateVariant(index, { discountPercent: Number(event.target.value) })} type="number" value={variant.discountPercent} />
            <Input label="Barcode" onChange={(event) => updateVariant(index, { barcode: event.target.value })} value={variant.barcode} />
            <label className="flex items-center gap-2 rounded-md bg-white p-3 text-sm font-bold">
              <input checked={variant.stockTrackingEnabled} onChange={(event) => updateVariant(index, { stockTrackingEnabled: event.target.checked })} type="checkbox" />
              Stock tracking
            </label>
            <label className="flex items-center gap-2 rounded-md bg-white p-3 text-sm font-bold">
              <input checked={variant.isSubscriptionEligible} onChange={(event) => updateVariant(index, { isSubscriptionEligible: event.target.checked })} type="checkbox" />
              Subscription eligible
            </label>
          </div>
        </div>
      ))}
      <button className="focus-ring inline-flex w-fit items-center gap-2 rounded-md bg-ink px-4 py-2 text-sm font-black text-white" onClick={addVariant} type="button">
        <Plus className="h-4 w-4" /> Add variant
      </button>
    </div>
  );
}

function SeoTab({ form, updateForm }: ProductTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="SEO title" onChange={(event) => updateForm("seoTitle", event.target.value)} value={form.seoTitle} />
      <Input label="SEO description" onChange={(event) => updateForm("seoDescription", event.target.value)} value={form.seoDescription} />
    </div>
  );
}

function ComplianceTab({ form, updateForm }: ProductTabProps) {
  const claimWarnings = scanClaimText(`${form.productClaims} ${form.warningDisclaimer}`);
  const missingAssets = [
    !form.labelImages.trim() ? "label image" : "",
    !form.nutritionLabelImage.trim() ? "nutrition label image" : "",
    !form.labReportUrl.trim() ? "lab report / COA" : ""
  ].filter(Boolean);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input label="FSSAI / license field" onChange={(event) => updateForm("fssaiLicense", event.target.value)} value={form.fssaiLicense} />
      <Input label="Manufacturer name" onChange={(event) => updateForm("manufacturerName", event.target.value)} value={form.manufacturerName} />
      <Input label="Marketer / importer name" onChange={(event) => updateForm("marketerImporterName", event.target.value)} value={form.marketerImporterName} />
      <ImageUploadField label="Nutrition label image" onChange={(value) => updateForm("nutritionLabelImage", value)} value={form.nutritionLabelImage} />
      <Textarea label="Ingredient declaration" onChange={(value) => updateForm("ingredients", value)} value={form.ingredients} />
      <Textarea label="Allergen declaration" onChange={(value) => updateForm("allergenInfo", value)} value={form.allergenInfo} />
      <Textarea label="Warning / disclaimer" onChange={(value) => updateForm("warningDisclaimer", value)} value={form.warningDisclaimer} />
      <Textarea label="Product claims" onChange={(value) => updateForm("productClaims", value)} value={form.productClaims} />
      <Textarea label="Storage instructions" onChange={(value) => updateForm("storageInstructions", value)} value={form.storageInstructions} />
      <SelectField label="Compliance status" onChange={(value) => updateForm("complianceStatus", value as EditableProduct["complianceStatus"])} value={form.complianceStatus}>
        <option value="pending">Pending</option>
        <option value="approved">Approved</option>
        <option value="rejected">Rejected</option>
        <option value="needs_update">Needs update</option>
      </SelectField>
      <div className="rounded-md bg-mist p-4 text-sm font-semibold text-slate">
        <p className="font-black text-ink">Compliance guard</p>
        <p className="mt-2">Label image is required. Batch and expiry visibility is required before publish.</p>
        <p className="mt-2">Lab report/COA: {form.labReportUrl || "Pending"}</p>
        <p className="mt-2">Not for medicinal use text must stay visible.</p>
        {missingAssets.length > 0 ? (
          <p className="mt-3 rounded-md bg-white p-2 text-coral">Missing: {missingAssets.join(", ")}</p>
        ) : null}
        {claimWarnings.length > 0 ? (
          <p className="mt-3 rounded-md bg-coral p-2 text-white">
            Claim warning: {claimWarnings.join(", ")}. Prevent disease cure claims before approval.
          </p>
        ) : (
          <p className="mt-3 rounded-md bg-mint p-2 text-forest">No disease-claim terms detected in this draft.</p>
        )}
      </div>
    </div>
  );
}

function RelatedTab({ form, updateForm }: ProductTabProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Textarea label="Related products" onChange={(value) => updateForm("relatedProducts", value)} value={form.relatedProducts} />
      <div className="rounded-md bg-mist p-4 text-sm font-semibold text-slate">
        Frequently bought together, compare products, and recommended stack settings can be mapped here.
      </div>
    </div>
  );
}

type ProductTabProps = {
  form: EditableProduct;
  updateForm: <K extends keyof EditableProduct>(key: K, value: EditableProduct[K]) => void;
};

function CategoryManagement({ onAction }: { onAction: (action: string) => void }) {
  return (
    <AdminCard title="Category management">
      <div className="grid gap-3">
        {categories.map((category) => (
          <div className="rounded-md border border-black/10 p-3" key={category.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-ink">{category.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate">SEO fields, parent category, image/banner, and filter settings ready.</p>
              </div>
              <div className="flex gap-2">
                <button className="admin-action" onClick={() => onAction("edit")} type="button">Edit</button>
                <button className="admin-action text-coral" onClick={() => window.confirm("Delete category?") && onAction("delete")} type="button">Delete</button>
              </div>
            </div>
          </div>
        ))}
        <button className="focus-ring rounded-md bg-ink px-4 py-2 text-sm font-black text-white" onClick={() => onAction("create")} type="button">
          Create category
        </button>
      </div>
    </AdminCard>
  );
}

function BrandManagement({ onAction }: { onAction: (action: string) => void }) {
  return (
    <AdminCard title="Brand management">
      <div className="grid gap-3">
        {brands.map((brand) => (
          <div className="rounded-md border border-black/10 p-3" key={brand.id}>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-black text-ink">{brand.name}</p>
                <p className="mt-1 text-xs font-semibold text-slate">Logo, description, brand page SEO, active/inactive.</p>
              </div>
              <button className="admin-action" onClick={() => onAction("toggle")} type="button">
                {brand.isActive ? "Deactivate" : "Activate"}
              </button>
            </div>
          </div>
        ))}
        <button className="focus-ring rounded-md bg-ink px-4 py-2 text-sm font-black text-white" onClick={() => onAction("create")} type="button">
          Create brand
        </button>
      </div>
    </AdminCard>
  );
}

function SelectField({
  children,
  label,
  onChange,
  value
}: {
  children: ReactNode;
  label: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <select className="focus-ring h-11 w-full rounded-md border border-black/10 bg-white px-3 text-sm text-ink" onChange={(event) => onChange(event.target.value)} value={value}>
        {children}
      </select>
    </label>
  );
}

function Textarea({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block md:col-span-2">
      <span className="mb-2 block text-sm font-semibold text-ink">{label}</span>
      <textarea className="focus-ring min-h-28 w-full rounded-md border border-black/10 bg-white p-3 text-sm text-ink" onChange={(event) => onChange(event.target.value)} value={value} />
    </label>
  );
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-card border border-black/10 bg-white p-4 text-sm font-bold text-ink shadow-card">
      <AlertTriangle className="h-5 w-5 text-forest" />
      <span>{message}</span>
      <button className="ml-auto text-slate" onClick={onDismiss} type="button">
        Dismiss
      </button>
    </div>
  );
}

function audit(session: AdminSession | null, action: string, entityType: string, entityId?: string, metadata?: Record<string, unknown>) {
  writeAdminAuditLog(session, {
    action,
    entityId,
    entityType,
    metadata
  });
}

function auditAndToast(
  session: AdminSession | null,
  action: string,
  entityType: "Brand" | "Category",
  setToast: (message: string) => void
) {
  writeAdminAuditLog(session, {
    action: `admin.${entityType.toLowerCase()}.${action}`,
    entityType
  });
  setToast(`${entityType} ${action} completed.`);
}

function validateProduct(form: EditableProduct) {
  const errors: Record<string, string> = {};

  if (form.name.trim().length < 3) errors.name = "Product name is required.";
  if (!/^[a-z0-9-]+$/.test(form.slug)) errors.slug = "Use lowercase slug with hyphens.";
  if (form.variants.length === 0) errors.variants = "At least one variant is required.";
  if (form.variants.some((variant) => !variant.sku.trim())) errors.variants = "Every variant needs an SKU.";
  if (form.complianceStatus === "approved" && !form.labelImages.trim()) errors.labelImages = "Label image is required for compliance approval.";
  if (form.complianceStatus === "approved" && !form.nutritionLabelImage.trim()) errors.nutritionLabelImage = "Nutrition label image is required for compliance approval.";
  if (form.complianceStatus === "approved" && scanClaimText(form.productClaims).length > 0) {
    errors.productClaims = "Disease cure/treat/prevent claims must be removed before approval.";
  }

  return errors;
}

function slugFromName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getMissingLiveProductFields(form: LiveProductForm) {
  const missing: string[] = [];

  if (form.brandName.trim().length < 2) missing.push("brand");
  if (form.categoryName.trim().length < 2) missing.push("category");
  if (form.name.trim().length < 3) missing.push("product name");
  if (!/^[a-z0-9-]{3,}$/.test(form.slug)) missing.push("valid slug");
  if (form.sku.trim().length < 3) missing.push("SKU");
  if (form.mrp <= 0) missing.push("MRP");
  if (form.sellingPrice <= 0) missing.push("selling price");
  if (form.weightInGrams <= 0) missing.push("weight");
  if (form.shortDescription.trim().length < 8) missing.push("short description");
  if (form.description.trim().length < 10) missing.push("description");

  return missing;
}
