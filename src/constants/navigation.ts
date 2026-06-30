export const ADMIN_NAVIGATION = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/catalog", label: "Catalog" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/customers", label: "Customers" },
  { href: "/admin/coupons", label: "Coupons" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/compliance", label: "Compliance" },
  { href: "/admin/marketing", label: "Marketing" },
  { href: "/admin/content", label: "CMS & Blog" },
  { href: "/admin/alignment", label: "Alignment" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/security", label: "Security" },
  { href: "/admin/audit", label: "Audit Logs" },
  { href: "/admin/settings", label: "Settings" }
] as const;

export const STOREFRONT_NAVIGATION = [
  { href: "/products", label: "Shop" },
  { href: "/collections/protein", label: "Protein" },
  { href: "/collections/performance", label: "Performance" },
  { href: "/blog", label: "Guides" }
] as const;
