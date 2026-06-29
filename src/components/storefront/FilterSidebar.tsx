import { categories, brands } from "@/mock";
import { Select } from "@/components/ui/Select";

export function FilterSidebar() {
  return (
    <aside className="rounded-card border border-black/10 bg-white p-4 shadow-sm">
      <h2 className="text-base font-black text-ink">Filters</h2>
      <div className="mt-5 grid gap-5">
        <div>
          <p className="mb-3 text-sm font-bold text-ink">Category</p>
          <div className="grid gap-2">
            {categories.map((category) => (
              <label key={category.id} className="flex items-center gap-2 text-sm font-medium text-slate">
                <input type="checkbox" className="h-4 w-4 accent-forest" />
                {category.name}
              </label>
            ))}
          </div>
        </div>
        <Select label="Brand">
          <option>All brands</option>
          {brands.map((brand) => (
            <option key={brand.id}>{brand.name}</option>
          ))}
        </Select>
        <Select label="Goal">
          <option>All goals</option>
          <option>Muscle support</option>
          <option>Strength</option>
          <option>Daily wellness</option>
        </Select>
      </div>
    </aside>
  );
}
