import { adminOrderReports, adminOrders } from "@/mock/adminOrders";
import { advancedInventoryItems, advancedStockMovements, inventoryBatchRecords } from "@/mock/adminInventory";
import { brands } from "@/mock/brands";
import { categories } from "@/mock/categories";
import { crmCustomerProfiles, productReviews } from "@/mock/engagement";
import { couponRules, promotionRules, subscriptions } from "@/mock/promotions";
import { searchAnalytics } from "@/mock/analytics";
import { storefrontProducts } from "@/mock/storefront";
import type { AdminOrder } from "@/types/orderOps";
import type { ReportDateRange } from "@/types/reports";

export const defaultReportRange: ReportDateRange = {
  endDate: "2026-06-29",
  startDate: "2026-06-01"
};

export function buildAnalyticsReport(range: ReportDateRange = defaultReportRange) {
  const orders = filterOrdersByRange(adminOrders, range);
  const sales = buildSalesOverview(orders, range);
  const product = buildProductAnalytics(orders);
  const category = buildCategoryAnalytics(orders);
  const brand = buildBrandAnalytics(orders);
  const customer = buildCustomerAnalytics();
  const inventory = buildInventoryReports();
  const order = buildOrderReports(orders);
  const promotions = buildPromotionReports(orders);
  const subscription = buildSubscriptionReports();

  return {
    brand,
    category,
    customer,
    inventory,
    order,
    product,
    promotions,
    range,
    sales,
    search: searchAnalytics,
    subscription
  };
}

export function filterOrdersByRange(orders: AdminOrder[], range: ReportDateRange) {
  const start = new Date(`${range.startDate}T00:00:00.000Z`).getTime();
  const end = new Date(`${range.endDate}T23:59:59.999Z`).getTime();

  return orders.filter((order) => {
    const placedAt = new Date(order.placedAt).getTime();
    return placedAt >= start && placedAt <= end;
  });
}

export function buildSalesOverview(orders: AdminOrder[], range: ReportDateRange) {
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const end = new Date(`${range.endDate}T23:59:59.999Z`);
  const weekStart = new Date(end);
  weekStart.setDate(end.getDate() - 6);
  const monthStart = new Date(end.getFullYear(), end.getMonth(), 1);
  const todayRevenue = revenueFromDate(orders, range.endDate);
  const weeklyRevenue = orders
    .filter((order) => new Date(order.placedAt) >= weekStart)
    .reduce((sum, order) => sum + order.totalAmount, 0);
  const monthlyRevenue = orders
    .filter((order) => new Date(order.placedAt) >= monthStart)
    .reduce((sum, order) => sum + order.totalAmount, 0);

  return {
    averageOrderValue: orders.length ? Math.round(totalRevenue / orders.length) : 0,
    conversionRatePlaceholder: 3.8,
    monthlyRevenue,
    orderCount: orders.length,
    todayRevenue,
    totalRevenue,
    weeklyRevenue
  };
}

export function buildProductAnalytics(orders: AdminOrder[]) {
  const productRows = storefrontProducts.map((product) => {
    const items = orders.flatMap((order) => order.items).filter((item) => item.productId === product.id);
    const units = items.reduce((sum, item) => sum + item.quantity, 0);
    const revenue = items.reduce((sum, item) => sum + item.totalAmount, 0);
    const estimatedCost = items.reduce((sum, item) => sum + Math.round(item.unitPrice * 0.62) * item.quantity, 0);
    const stock = product.variants.reduce((sum, variant) => sum + variant.stock, 0);
    const wishlistCount = crmCustomerProfiles.filter((profile) => profile.wishlistProductIds.includes(product.id)).length;
    const reviewCount = productReviews.filter((review) => review.productId === product.id).length;

    return {
      estimatedMargin: Math.max(0, revenue - estimatedCost),
      id: product.id,
      label: product.name,
      reviewCount,
      revenue,
      stock,
      units,
      wishlistCount
    };
  });

  return {
    highestMarginProducts: sortDesc(productRows, "estimatedMargin").slice(0, 5),
    lowSellingProducts: sortAsc(productRows, "units").slice(0, 5),
    mostReviewedProducts: sortDesc(productRows, "reviewCount").slice(0, 5),
    mostWishlistedProducts: sortDesc(productRows, "wishlistCount").slice(0, 5),
    outOfStockProducts: productRows.filter((product) => product.stock <= 0),
    topSellingProducts: sortDesc(productRows, "revenue").slice(0, 5)
  };
}

export function buildCategoryAnalytics(orders: AdminOrder[]) {
  return categories.map((category) => {
    const productIds = new Set(storefrontProducts.filter((product) => product.categoryIds.includes(category.id)).map((product) => product.id));
    const categoryOrders = orders.filter((order) => order.items.some((item) => productIds.has(item.productId)));
    const revenue = categoryOrders.reduce(
      (sum, order) => sum + order.items.filter((item) => productIds.has(item.productId)).reduce((itemSum, item) => itemSum + item.totalAmount, 0),
      0
    );

    return {
      conversionRatePlaceholder: Number((2.5 + categoryOrders.length * 0.7).toFixed(1)),
      id: category.id,
      label: category.name,
      orderCount: categoryOrders.length,
      revenue
    };
  });
}

export function buildBrandAnalytics(orders: AdminOrder[]) {
  return brands.map((brand) => {
    const productIds = new Set(storefrontProducts.filter((product) => product.brandId === brand.id).map((product) => product.id));
    const brandOrders = orders.filter((order) => order.items.some((item) => productIds.has(item.productId)));
    const revenue = brandOrders.reduce(
      (sum, order) => sum + order.items.filter((item) => productIds.has(item.productId)).reduce((itemSum, item) => itemSum + item.totalAmount, 0),
      0
    );
    const returned = brandOrders.filter((order) => order.return.status !== "none").length;

    return {
      id: brand.id,
      label: brand.name,
      orderCount: brandOrders.length,
      returnRatePlaceholder: brandOrders.length ? Math.round((returned / brandOrders.length) * 100) : 0,
      revenue
    };
  });
}

export function buildCustomerAnalytics() {
  const repeatCustomers = crmCustomerProfiles.filter((profile) => profile.repeatPurchaseCount > 1);
  const vipCustomers = crmCustomerProfiles.filter((profile) => profile.segments.includes("VIP"));
  const inactiveCustomers = crmCustomerProfiles.filter((profile) => profile.segments.includes("inactive"));
  const totalLifetimeValue = crmCustomerProfiles.reduce((sum, profile) => sum + profile.lifetimeValue, 0);

  return {
    customerLifetimeValue: crmCustomerProfiles.length ? Math.round(totalLifetimeValue / crmCustomerProfiles.length) : 0,
    inactiveCustomers: inactiveCustomers.length,
    newCustomers: crmCustomerProfiles.filter((profile) => profile.repeatPurchaseCount <= 1).length,
    repeatCustomers: repeatCustomers.length,
    repeatPurchaseRate: crmCustomerProfiles.length ? Math.round((repeatCustomers.length / crmCustomerProfiles.length) * 100) : 0,
    vipCustomers: vipCustomers.length
  };
}

export function buildInventoryReports() {
  const valuation = inventoryBatchRecords.reduce((sum, batch) => sum + batch.availableQuantity * batch.purchaseCost, 0);
  const lowStock = advancedInventoryItems.filter(
    (item) => item.availableStock <= item.lowStockThreshold || item.availableStock <= item.reorderPoint
  );
  const expiryRisk = advancedInventoryItems.filter((item) => item.expiryStatus !== "valid");
  const deadStock = advancedInventoryItems.filter((item) => item.availableStock > item.reorderPoint * 4 && item.reservedStock === 0);

  return {
    batchWiseStock: inventoryBatchRecords,
    deadStock,
    expiryRisk,
    inventoryValuation: valuation,
    lowStock,
    stockMovement: advancedStockMovements
  };
}

export function buildOrderReports(orders: AdminOrder[]) {
  return {
    cancelledOrders: orders.filter((order) => order.status === "cancelled"),
    codVsPrepaid: countBy(orders, (order) => order.payment.method),
    ordersByStatus: countBy(orders, (order) => order.status),
    paymentMethodReport: countBy(orders, (order) => order.payment.provider),
    refundReport: orders.filter((order) => order.return.refundStatus !== "not_started"),
    returnRequests: orders.filter((order) => order.return.status !== "none"),
    rtoReport: adminOrderReports.courierPerformance.map((carrier) => ({
      carrier: carrier.carrier,
      rto: carrier.rto,
      rtoRate: Math.round((carrier.rto / Math.max(1, carrier.delivered + carrier.ndr + carrier.rto)) * 100)
    }))
  };
}

export function buildPromotionReports(orders: AdminOrder[]) {
  const couponUsage = couponRules.map((coupon) => {
    const matchingOrders = orders.filter((order) => order.couponCode === coupon.code);
    return {
      code: coupon.code,
      discountGiven: matchingOrders.reduce((sum, order) => sum + order.discountAmount, 0),
      revenue: matchingOrders.reduce((sum, order) => sum + order.totalAmount, 0),
      usageCount: coupon.usageCount
    };
  });

  return {
    campaignRoiPlaceholder: promotionRules.map((promotion) => ({
      name: promotion.name,
      orders: promotion.performance.orders,
      revenue: promotion.performance.revenue,
      roi: Number((promotion.performance.revenue / Math.max(1, promotion.value * 1000)).toFixed(1))
    })),
    couponRevenue: couponUsage.reduce((sum, coupon) => sum + coupon.revenue, 0),
    couponUsage,
    discountGiven: orders.reduce((sum, order) => sum + order.discountAmount, 0)
  };
}

export function buildSubscriptionReports() {
  const productPriceById = Object.fromEntries(
    storefrontProducts.map((product) => [product.id, product.variants[0]?.sellingPrice ?? 0])
  );
  const renewalRevenue = subscriptions
    .filter((subscription) => subscription.status === "active")
    .reduce((sum, subscription) => sum + (productPriceById[subscription.productId] ?? 0), 0);

  return {
    activeSubscriptions: subscriptions.filter((subscription) => subscription.status === "active").length,
    cancelledSubscriptions: subscriptions.filter((subscription) => subscription.status === "cancelled").length,
    churnPlaceholder: 4.5,
    pausedSubscriptions: subscriptions.filter((subscription) => subscription.status === "paused").length,
    renewalRevenue
  };
}

export const databaseOptimizationNotes = [
  "Index orders on placed_at, status, payment_method, customer_id, and coupon_code.",
  "Index order_items on product_id, variant_id, batch_id, and order_id.",
  "Use materialized daily sales aggregates for dashboard cards and date-range charts.",
  "Index inventory batches on expiry_date, warehouse_id, variant_id, qc_status, and available_quantity.",
  "Store search events with term, result_count, customer_id, clicked_product_id, and purchased_order_id for search-to-purchase analysis."
] as const;

function revenueFromDate(orders: AdminOrder[], date: string) {
  return orders
    .filter((order) => order.placedAt.startsWith(date))
    .reduce((sum, order) => sum + order.totalAmount, 0);
}

function sortDesc<T>(rows: T[], key: keyof T) {
  return [...rows].sort((a, b) => Number(b[key]) - Number(a[key]));
}

function sortAsc<T>(rows: T[], key: keyof T) {
  return [...rows].sort((a, b) => Number(a[key]) - Number(b[key]));
}

function countBy<T>(rows: T[], select: (row: T) => string) {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = select(row);
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
}
