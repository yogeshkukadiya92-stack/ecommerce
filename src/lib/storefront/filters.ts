import type { StorefrontProduct } from "@/mock/storefront";

export type SortOption = "popularity" | "newest" | "price-asc" | "price-desc" | "rating" | "discount";

export type ProductFilterState = {
  brand: string[];
  category: string[];
  discount: boolean;
  flavor: string[];
  goal: string[];
  glutenFree: boolean;
  inStock: boolean;
  labReport: boolean;
  lactoseFree: boolean;
  maxPrice?: number;
  minPrice?: number;
  minProtein?: number;
  minRating?: number;
  minServings?: number;
  size: string[];
  sort: SortOption;
  subscription: boolean;
  sugarFree: boolean;
  type: string[];
};

export const defaultFilters: ProductFilterState = {
  brand: [],
  category: [],
  discount: false,
  flavor: [],
  goal: [],
  glutenFree: false,
  inStock: false,
  labReport: false,
  lactoseFree: false,
  size: [],
  sort: "popularity",
  subscription: false,
  sugarFree: false,
  type: []
};

export function getProductSearchText(product: StorefrontProduct) {
  return [
    product.name,
    product.shortDescription,
    product.description,
    product.merchandising.brandName,
    product.merchandising.categorySlug,
    product.goalTags.join(" "),
    product.merchandising.flavors.join(" "),
    product.merchandising.sizes.join(" "),
    product.ingredients.join(" ")
  ]
    .join(" ")
    .toLowerCase();
}

export function getActiveFilterCount(filters: ProductFilterState) {
  return (
    filters.brand.length +
    filters.category.length +
    filters.flavor.length +
    filters.goal.length +
    filters.size.length +
    filters.type.length +
    Number(filters.discount) +
    Number(filters.glutenFree) +
    Number(filters.inStock) +
    Number(filters.labReport) +
    Number(filters.lactoseFree) +
    Number(Boolean(filters.maxPrice)) +
    Number(Boolean(filters.minPrice)) +
    Number(Boolean(filters.minProtein)) +
    Number(Boolean(filters.minRating)) +
    Number(Boolean(filters.minServings)) +
    Number(filters.subscription) +
    Number(filters.sugarFree)
  );
}

export function parseFilters(searchParams: URLSearchParams): ProductFilterState {
  return {
    ...defaultFilters,
    brand: searchParams.getAll("brand"),
    category: searchParams.getAll("category"),
    discount: searchParams.get("discount") === "true",
    flavor: searchParams.getAll("flavor"),
    goal: searchParams.getAll("goal"),
    glutenFree: searchParams.get("glutenFree") === "true",
    inStock: searchParams.get("inStock") === "true",
    labReport: searchParams.get("labReport") === "true",
    lactoseFree: searchParams.get("lactoseFree") === "true",
    maxPrice: numberParam(searchParams.get("maxPrice")),
    minPrice: numberParam(searchParams.get("minPrice")),
    minProtein: numberParam(searchParams.get("minProtein")),
    minRating: numberParam(searchParams.get("minRating")),
    minServings: numberParam(searchParams.get("minServings")),
    size: searchParams.getAll("size"),
    sort: parseSort(searchParams.get("sort")),
    subscription: searchParams.get("subscription") === "true",
    sugarFree: searchParams.get("sugarFree") === "true",
    type: searchParams.getAll("type")
  };
}

export function serializeFilters(filters: ProductFilterState, query: string) {
  const params = new URLSearchParams();

  if (query.trim()) {
    params.set("q", query.trim());
  }

  addArray(params, "brand", filters.brand);
  addArray(params, "category", filters.category);
  addArray(params, "flavor", filters.flavor);
  addArray(params, "goal", filters.goal);
  addArray(params, "size", filters.size);
  addArray(params, "type", filters.type);

  addBoolean(params, "discount", filters.discount);
  addBoolean(params, "glutenFree", filters.glutenFree);
  addBoolean(params, "inStock", filters.inStock);
  addBoolean(params, "labReport", filters.labReport);
  addBoolean(params, "lactoseFree", filters.lactoseFree);
  addBoolean(params, "subscription", filters.subscription);
  addBoolean(params, "sugarFree", filters.sugarFree);
  addNumber(params, "maxPrice", filters.maxPrice);
  addNumber(params, "minPrice", filters.minPrice);
  addNumber(params, "minProtein", filters.minProtein);
  addNumber(params, "minRating", filters.minRating);
  addNumber(params, "minServings", filters.minServings);

  if (filters.sort !== "popularity") {
    params.set("sort", filters.sort);
  }

  return params;
}

export function filterProducts(
  products: StorefrontProduct[],
  filters: ProductFilterState,
  query: string
) {
  const normalizedQuery = query.trim().toLowerCase();

  return products.filter((product) => {
    const variant = product.variants[0];

    if (!variant) {
      return false;
    }

    if (normalizedQuery && !getProductSearchText(product).includes(normalizedQuery)) {
      return false;
    }

    if (filters.brand.length > 0 && !filters.brand.includes(product.merchandising.brandName)) {
      return false;
    }

    if (filters.category.length > 0 && !filters.category.includes(product.merchandising.categorySlug)) {
      return false;
    }

    if (filters.goal.length > 0 && !filters.goal.some((goal) => product.goalTags.includes(goal))) {
      return false;
    }

    if (
      filters.flavor.length > 0 &&
      !filters.flavor.some((flavor) => product.merchandising.flavors.includes(flavor))
    ) {
      return false;
    }

    if (
      filters.size.length > 0 &&
      !filters.size.some((size) => product.merchandising.sizes.includes(size))
    ) {
      return false;
    }

    if (filters.type.length > 0 && !filters.type.includes(product.merchandising.dietaryType)) {
      return false;
    }

    if (filters.minPrice && variant.sellingPrice < filters.minPrice) {
      return false;
    }

    if (filters.maxPrice && variant.sellingPrice > filters.maxPrice) {
      return false;
    }

    if (filters.minRating && product.merchandising.rating < filters.minRating) {
      return false;
    }

    if (filters.minProtein && product.merchandising.proteinPerServing < filters.minProtein) {
      return false;
    }

    if (filters.minServings && product.merchandising.servingsCount < filters.minServings) {
      return false;
    }

    if (filters.discount && variant.discountPercent <= 0) {
      return false;
    }

    if (filters.glutenFree && !product.merchandising.isGlutenFree) {
      return false;
    }

    if (filters.inStock && variant.stock <= 0) {
      return false;
    }

    if (filters.labReport && !product.labReportUrl) {
      return false;
    }

    if (filters.lactoseFree && !product.merchandising.isLactoseFree) {
      return false;
    }

    if (filters.subscription && !product.merchandising.isSubscriptionAvailable) {
      return false;
    }

    if (filters.sugarFree && !product.merchandising.isSugarFree) {
      return false;
    }

    return true;
  });
}

export function sortProducts(products: StorefrontProduct[], sort: SortOption) {
  return [...products].sort((left, right) => {
    const leftVariant = left.variants[0];
    const rightVariant = right.variants[0];

    switch (sort) {
      case "newest":
        return Number(right.merchandising.isNewArrival) - Number(left.merchandising.isNewArrival);
      case "price-asc":
        return (leftVariant?.sellingPrice ?? 0) - (rightVariant?.sellingPrice ?? 0);
      case "price-desc":
        return (rightVariant?.sellingPrice ?? 0) - (leftVariant?.sellingPrice ?? 0);
      case "rating":
        return right.merchandising.rating - left.merchandising.rating;
      case "discount":
        return (rightVariant?.discountPercent ?? 0) - (leftVariant?.discountPercent ?? 0);
      case "popularity":
      default:
        return right.merchandising.popularity - left.merchandising.popularity;
    }
  });
}

export function getFilterOptions(products: StorefrontProduct[]) {
  const brands = new Set<string>();
  const categories = new Set<string>();
  const flavors = new Set<string>();
  const goals = new Set<string>();
  const sizes = new Set<string>();

  for (const product of products) {
    brands.add(product.merchandising.brandName);
    categories.add(product.merchandising.categorySlug);
    product.goalTags.forEach((goal) => goals.add(goal));
    product.merchandising.flavors.forEach((flavor) => flavors.add(flavor));
    product.merchandising.sizes.forEach((size) => sizes.add(size));
  }

  return {
    brands: [...brands].sort(),
    categories: [...categories].sort(),
    flavors: [...flavors].sort(),
    goals: [...goals].sort(),
    sizes: [...sizes].sort(),
    types: ["veg", "vegan", "non-veg"]
  };
}

function addArray(params: URLSearchParams, key: string, values: string[]) {
  values.forEach((value) => {
    if (value) {
      params.append(key, value);
    }
  });
}

function addBoolean(params: URLSearchParams, key: string, value: boolean) {
  if (value) {
    params.set(key, "true");
  }
}

function addNumber(params: URLSearchParams, key: string, value?: number) {
  if (value) {
    params.set(key, String(value));
  }
}

function numberParam(value: string | null) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function parseSort(value: string | null): SortOption {
  const validSorts: SortOption[] = ["popularity", "newest", "price-asc", "price-desc", "rating", "discount"];
  return validSorts.includes(value as SortOption) ? (value as SortOption) : "popularity";
}
