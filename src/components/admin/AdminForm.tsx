import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { AdminCard } from "./AdminCard";

export function AdminFormPreview() {
  return (
    <AdminCard title="Admin form preview">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Product name" placeholder="NutraForge Whey Elite" />
        <Select label="Status">
          <option>Active</option>
          <option>Draft</option>
          <option>Archived</option>
        </Select>
        <Input label="SKU" placeholder="NF-WHEY-CHOCO-1KG" />
        <Input label="Low stock threshold" placeholder="20" type="number" />
      </div>
      <div className="mt-5 flex justify-end gap-3">
        <Button href="/admin" variant="secondary">
          Cancel
        </Button>
        <Button href="/admin" variant="dark">
          Save preview
        </Button>
      </div>
    </AdminCard>
  );
}
