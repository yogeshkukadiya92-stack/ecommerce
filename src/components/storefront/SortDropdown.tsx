import { Select } from "@/components/ui/Select";

export function SortDropdown() {
  return (
    <Select aria-label="Sort products" className="min-w-48">
      <option>Featured</option>
      <option>Price: low to high</option>
      <option>Price: high to low</option>
      <option>Newest first</option>
      <option>Top rated</option>
    </Select>
  );
}
