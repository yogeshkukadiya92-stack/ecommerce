export type ReportDateRange = {
  endDate: string;
  startDate: string;
};

export type RankedMetric = {
  id: string;
  label: string;
  metric: number;
  secondaryMetric?: number;
};

export type SalesOverviewReport = {
  averageOrderValue: number;
  conversionRatePlaceholder: number;
  monthlyRevenue: number;
  orderCount: number;
  todayRevenue: number;
  totalRevenue: number;
  weeklyRevenue: number;
};

export type AnalyticsReport = {
  range: ReportDateRange;
  sales: SalesOverviewReport;
};
