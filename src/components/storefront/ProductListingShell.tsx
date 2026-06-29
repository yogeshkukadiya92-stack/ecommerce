"use client";

import { SlidersHorizontal, X } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { StorefrontProduct } from "@/mock/storefront";
import { popularSearches, storefrontProducts } from "@/mock/storefront";
import {
  defaultFilters,
  filterProducts,
  getActiveFilterCount,
  getFilterOptions,
  parseFilters,
  serializeFilters,
  sortProducts,
  type ProductFilterState,
  type SortOption
} from "@/lib/storefront/filters";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ProductCard } from "./ProductCard";
import { ProductFilterPanel } from "./ProductFilterPanel";

type ProductListingShellProps = {
  baseProducts: StorefrontProduct[];
  breadcrumbs: Array<{ href: string; label: string }>;
  description: string;
  recommendations?: StorefrontProduct[];
  seoContent?: {
    heading: string;
    text: string;
  };
  title: string;
};

const sortOptions: Array<{ label: string; value: SortOption }> = [
  { label: "Popularity", value: "popularity" },
  { label: "Newest", value: "newest" },
  { label: "Price low to high", value: "price-asc" },
  { label: "Price high to low", value: "price-desc" },
  { label: "Rating", value: "rating" },
  { label: "Discount", value: "discount" }
];

export function ProductListingShell({
  baseProducts,
  breadcrumbs,
  description,
  recommendations = storefrontProducts,
  seoContent,
  title
}: ProductListingShellProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<ProductFilterState>(() => parseFilters(searchParams));
  const deferredQuery = useDeferredValue(query);
  const options = useMemo(() => getFilterOptions(storefrontProducts), []);
  const activeFilterCount = getActiveFilterCount(filters);

  const filteredProducts = useMemo(() => {
    const filtered = filterProducts(baseProducts, filters, deferredQuery);
    return sortProducts(filtered, filters.sort);
  }, [baseProducts, deferredQuery, filters]);
  const [visibleCount, setVisibleCount] = useState(12);
  const visibleProducts = filteredProducts.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(12);
  }, [deferredQuery, filters]);

  useEffect(() => {
    const saved = window.localStorage.getItem("fitsupplement.recent-searches.v1");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.filter((item) => typeof item === "string").slice(0, 6));
        }
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  const suggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return popularSearches.slice(0, 5);
    }

    return storefrontProducts
      .filter((product) => product.name.toLowerCase().includes(normalizedQuery))
      .map((product) => product.name)
      .slice(0, 5);
  }, [query]);

  function commitUrl(nextFilters: ProductFilterState, nextQuery: string) {
    const params = serializeFilters(nextFilters, nextQuery);
    const url = params.size > 0 ? `${pathname}?${params.toString()}` : pathname;
    const trimmedQuery = nextQuery.trim();

    if (trimmedQuery) {
      const nextRecent = [trimmedQuery, ...recentSearches.filter((item) => item.toLowerCase() !== trimmedQuery.toLowerCase())].slice(0, 6);
      setRecentSearches(nextRecent);
      window.localStorage.setItem("fitsupplement.recent-searches.v1", JSON.stringify(nextRecent));
    }

    startTransition(() => router.replace(url, { scroll: false }));
  }

  function updateFilters(nextFilters: ProductFilterState) {
    setFilters(nextFilters);
    commitUrl(nextFilters, query);
  }

  function handleArrayToggle(key: keyof ProductFilterState, value: string) {
    const current = filters[key];

    if (!Array.isArray(current)) {
      return;
    }

    const nextValues = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];

    updateFilters({
      ...filters,
      [key]: nextValues
    });
  }

  function handleBooleanToggle(key: keyof ProductFilterState) {
    updateFilters({
      ...filters,
      [key]: !filters[key]
    });
  }

  function handleNumberChange(key: keyof ProductFilterState, value: string) {
    updateFilters({
      ...filters,
      [key]: value ? Number(value) : undefined
    });
  }

  function handleSortChange(value: string) {
    updateFilters({
      ...filters,
      sort: value as SortOption
    });
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    commitUrl(filters, query);
  }

  function clearAll() {
    setQuery("");
    setFilters(defaultFilters);
    startTransition(() => router.replace(pathname, { scroll: false }));
  }

  return (
    <main className="container-page pb-16 pt-8">
      <Breadcrumbs items={breadcrumbs} />
      <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-ink sm:text-4xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate">{description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {["Authentic products", "Batch verified", "Secure checkout", "Fast delivery", "Easy returns"].map((item) => (
              <span className="rounded-md bg-white px-3 py-2 text-xs font-black text-forest shadow-sm" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <form className="relative" onSubmit={handleSearchSubmit}>
          <input
            aria-label="Search products"
            className="focus-ring h-12 w-full rounded-md border border-black/10 bg-white px-4 text-sm font-semibold text-ink shadow-sm placeholder:text-slate lg:w-96"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search whey, creatine, vegan..."
            value={query}
          />
          <div className="mt-2 flex flex-wrap gap-2">
            {suggestions.map((suggestion) => (
              <button
                className="rounded-md bg-white px-2 py-1 text-xs font-bold text-slate shadow-sm hover:text-ink"
                key={suggestion}
                onClick={() => {
                  setQuery(suggestion);
                  commitUrl(filters, suggestion);
                }}
                type="button"
              >
                {suggestion}
              </button>
            ))}
          </div>
          {recentSearches.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="py-1 text-xs font-black uppercase tracking-[0.12em] text-slate">Recent</span>
              {recentSearches.map((recent) => (
                <button
                  className="rounded-md bg-mint px-2 py-1 text-xs font-bold text-forest"
                  key={recent}
                  onClick={() => {
                    setQuery(recent);
                    commitUrl(filters, recent);
                  }}
                  type="button"
                >
                  {recent}
                </button>
              ))}
            </div>
          ) : null}
        </form>
      </div>

      <div className="sticky top-[124px] z-30 mt-6 grid grid-cols-2 gap-2 border-y border-black/10 bg-mist py-3 lg:hidden">
        <button
          className="focus-ring flex h-11 items-center justify-center gap-2 rounded-md bg-ink text-sm font-black text-white"
          onClick={() => setIsFilterOpen(true)}
          type="button"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters {activeFilterCount ? `(${activeFilterCount})` : ""}
        </button>
        <select
          className="focus-ring h-11 rounded-md border border-black/10 bg-white px-3 text-sm font-black text-ink"
          onChange={(event) => handleSortChange(event.target.value)}
          value={filters.sort}
        >
          {sortOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <ProductFilterPanel
            filters={filters}
            onArrayToggle={handleArrayToggle}
            onBooleanToggle={handleBooleanToggle}
            onNumberChange={handleNumberChange}
            options={options}
          />
        </div>
        <section>
          <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <p className="text-sm font-bold text-slate">
              {filteredProducts.length} product{filteredProducts.length === 1 ? "" : "s"}
              {isPending ? " updating..." : ""}
            </p>
            <div className="hidden items-center gap-3 lg:flex">
              {activeFilterCount > 0 || query ? (
                <button className="text-sm font-black text-forest" onClick={clearAll} type="button">
                  Clear all
                </button>
              ) : null}
              <select
                className="focus-ring h-11 rounded-md border border-black/10 bg-white px-3 text-sm font-black text-ink"
                onChange={(event) => handleSortChange(event.target.value)}
                value={filters.sort}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {filteredProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                {visibleProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {visibleProducts.length < filteredProducts.length ? (
                <div className="mt-6 flex justify-center">
                  <button
                    className="focus-ring h-12 rounded-md border border-black/10 bg-white px-5 text-sm font-black text-ink shadow-sm hover:border-forest"
                    onClick={() => setVisibleCount((current) => current + 12)}
                    type="button"
                  >
                    Load more products
                  </button>
                </div>
              ) : null}
            </>
          ) : (
            <div className="grid gap-6">
              <EmptyState
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button href="/products" variant="dark">
                      Reset to all products
                    </Button>
                    <Button href="/collections/best-sellers" variant="secondary">
                      Browse best sellers
                    </Button>
                  </div>
                }
                description="Try a broader search, clear filters, or shop recommended protein, creatine, and wellness picks below."
                title="No products found"
              />
              <div>
                <h2 className="mb-4 text-xl font-black text-ink">Recommended instead</h2>
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
                  {recommendations.slice(0, 3).map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {seoContent ? (
        <section className="mt-12 rounded-card border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-2xl font-black tracking-tight text-ink">{seoContent.heading}</h2>
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate">{seoContent.text}</p>
        </section>
      ) : null}

      {isFilterOpen ? (
        <div aria-modal="true" className="fixed inset-0 z-50 bg-ink/40 lg:hidden" role="dialog">
          <div className="ml-auto h-full w-[90vw] max-w-sm overflow-y-auto bg-mist p-4 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-black text-ink">Filters</h2>
              <button
                aria-label="Close filters"
                className="focus-ring rounded-md bg-white p-2 text-ink"
                onClick={() => setIsFilterOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ProductFilterPanel
              filters={filters}
              onArrayToggle={handleArrayToggle}
              onBooleanToggle={handleBooleanToggle}
              onNumberChange={handleNumberChange}
              options={options}
            />
            <button
              className="focus-ring mt-4 h-12 w-full rounded-md bg-ink text-sm font-black text-white"
              onClick={() => setIsFilterOpen(false)}
              type="button"
            >
              Show {filteredProducts.length} products
            </button>
          </div>
        </div>
      ) : null}
    </main>
  );
}
