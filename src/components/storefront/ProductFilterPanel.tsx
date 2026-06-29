"use client";

import type { ProductFilterState } from "@/lib/storefront/filters";
import { Input } from "@/components/ui/Input";

type FilterOptions = {
  brands: string[];
  categories: string[];
  flavors: string[];
  goals: string[];
  sizes: string[];
  types: string[];
};

type ProductFilterPanelProps = {
  filters: ProductFilterState;
  options: FilterOptions;
  onArrayToggle: (key: keyof ProductFilterState, value: string) => void;
  onBooleanToggle: (key: keyof ProductFilterState) => void;
  onNumberChange: (key: keyof ProductFilterState, value: string) => void;
};

const booleanFilters: Array<{ key: keyof ProductFilterState; label: string }> = [
  { key: "inStock", label: "In stock" },
  { key: "discount", label: "Discounted" },
  { key: "subscription", label: "Subscription available" },
  { key: "labReport", label: "Lab report available" },
  { key: "sugarFree", label: "Sugar-free" },
  { key: "glutenFree", label: "Gluten-free" },
  { key: "lactoseFree", label: "Lactose-free" }
];

export function ProductFilterPanel({
  filters,
  onArrayToggle,
  onBooleanToggle,
  onNumberChange,
  options
}: ProductFilterPanelProps) {
  return (
    <aside className="rounded-card border border-black/10 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-black text-ink">Filters</h2>
        <span className="text-xs font-bold text-slate">Client-side</span>
      </div>
      <div className="mt-5 grid gap-6">
        <CheckboxGroup
          label="Category"
          onToggle={(value) => onArrayToggle("category", value)}
          selected={filters.category}
          values={options.categories}
        />
        <CheckboxGroup
          label="Brand"
          onToggle={(value) => onArrayToggle("brand", value)}
          selected={filters.brand}
          values={options.brands}
        />
        <CheckboxGroup
          label="Goal"
          onToggle={(value) => onArrayToggle("goal", value)}
          selected={filters.goal}
          values={options.goals}
        />
        <CheckboxGroup
          label="Flavor"
          onToggle={(value) => onArrayToggle("flavor", value)}
          selected={filters.flavor}
          values={options.flavors}
        />
        <CheckboxGroup
          label="Size"
          onToggle={(value) => onArrayToggle("size", value)}
          selected={filters.size}
          values={options.sizes}
        />
        <CheckboxGroup
          label="Veg / Non-veg"
          onToggle={(value) => onArrayToggle("type", value)}
          selected={filters.type}
          values={options.types}
        />
        <div>
          <p className="mb-3 text-sm font-black text-ink">Numeric filters</p>
          <div className="grid gap-3">
            <Input
              label="Min price"
              min={0}
              onChange={(event) => onNumberChange("minPrice", event.target.value)}
              placeholder="0"
              type="number"
              value={filters.minPrice ?? ""}
            />
            <Input
              label="Max price"
              min={0}
              onChange={(event) => onNumberChange("maxPrice", event.target.value)}
              placeholder="6000"
              type="number"
              value={filters.maxPrice ?? ""}
            />
            <Input
              label="Min rating"
              max={5}
              min={0}
              onChange={(event) => onNumberChange("minRating", event.target.value)}
              placeholder="4"
              step="0.1"
              type="number"
              value={filters.minRating ?? ""}
            />
            <Input
              label="Protein per serving"
              min={0}
              onChange={(event) => onNumberChange("minProtein", event.target.value)}
              placeholder="20"
              type="number"
              value={filters.minProtein ?? ""}
            />
            <Input
              label="Servings count"
              min={0}
              onChange={(event) => onNumberChange("minServings", event.target.value)}
              placeholder="30"
              type="number"
              value={filters.minServings ?? ""}
            />
          </div>
        </div>
        <div>
          <p className="mb-3 text-sm font-black text-ink">Product flags</p>
          <div className="grid gap-2">
            {booleanFilters.map((filter) => (
              <label key={filter.key} className="flex items-center gap-2 text-sm font-semibold text-slate">
                <input
                  checked={Boolean(filters[filter.key])}
                  className="h-4 w-4 accent-forest"
                  onChange={() => onBooleanToggle(filter.key)}
                  type="checkbox"
                />
                {filter.label}
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function CheckboxGroup({
  label,
  onToggle,
  selected,
  values
}: {
  label: string;
  onToggle: (value: string) => void;
  selected: string[];
  values: string[];
}) {
  if (values.length === 0) {
    return null;
  }

  return (
    <div>
      <p className="mb-3 text-sm font-black text-ink">{label}</p>
      <div className="grid max-h-44 gap-2 overflow-y-auto pr-1">
        {values.map((value) => (
          <label key={value} className="flex items-center gap-2 text-sm font-semibold text-slate">
            <input
              checked={selected.includes(value)}
              className="h-4 w-4 accent-forest"
              onChange={() => onToggle(value)}
              type="checkbox"
            />
            {value}
          </label>
        ))}
      </div>
    </div>
  );
}
