import { customers } from "@/mock/customers";
import {
  crmCustomerProfiles,
  marketingAutomationRules,
  productQuestions,
  productReviews
} from "@/mock/engagement";
import type {
  CrmCustomerProfile,
  CustomerSegment,
  ProductQuestionThread,
  ProductReview,
  ReviewModerationStatus
} from "@/types/engagement";

export function getApprovedReviewsByProduct(productId: string) {
  return productReviews.filter((review) => review.productId === productId && review.status === "approved");
}

export function getVisibleQuestionsByProduct(productId: string) {
  return productQuestions.filter((question) => question.productId === productId && question.status !== "hidden");
}

export function getReviewSummary(reviews: ProductReview[]) {
  const approvedReviews = reviews.filter((review) => review.status === "approved");
  const total = approvedReviews.length;
  const breakdown = [5, 4, 3, 2, 1].map((rating) => ({
    rating: rating as 1 | 2 | 3 | 4 | 5,
    count: approvedReviews.filter((review) => review.rating === rating).length
  }));

  const average = total
    ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / total
    : 0;
  const tasteAverage = averageFor(approvedReviews, "tasteRating");
  const mixabilityAverage = averageFor(approvedReviews, "mixabilityRating");
  const valueAverage = averageFor(approvedReviews, "valueRating");
  const tagCounts = new Map<string, number>();

  approvedReviews.forEach((review) => {
    review.tags.forEach((tag) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));
  });

  const commonTags = [...tagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag]) => tag);

  return {
    average,
    breakdown,
    commonTags,
    mixabilityAverage,
    tasteAverage,
    total,
    valueAverage
  };
}

export function getReviewModerationCounts() {
  return countBy(productReviews, (review) => review.status);
}

export function getQuestionModerationCounts() {
  return countBy(productQuestions, (question) => question.status);
}

export function getCustomerProfile(customerId: string): CrmCustomerProfile | undefined {
  return crmCustomerProfiles.find((profile) => profile.customerId === customerId);
}

export function getCustomerSegments(profile: CrmCustomerProfile): CustomerSegment[] {
  const segments = new Set<CustomerSegment>(profile.segments);

  if (profile.repeatPurchaseCount === 0) segments.add("new");
  if (profile.repeatPurchaseCount >= 2) segments.add("repeat");
  if (profile.lifetimeValue >= 10000) segments.add("VIP");
  if (profile.codRiskScore === "high") segments.add("COD risk");
  if (profile.returnRatePercent >= 20) segments.add("high return rate");

  return [...segments];
}

export function getCrmRows() {
  return customers.map((customer) => {
    const profile = getCustomerProfile(customer.id);
    return {
      customer,
      profile,
      segments: profile ? getCustomerSegments(profile) : (["new"] as CustomerSegment[])
    };
  });
}

export function getAutomationStats() {
  return {
    active: marketingAutomationRules.filter((rule) => rule.status === "active").length,
    paused: marketingAutomationRules.filter((rule) => rule.status === "paused").length,
    sent: marketingAutomationRules.reduce((sum, rule) => sum + rule.sentCount, 0),
    revenue: marketingAutomationRules.reduce((sum, rule) => sum + (rule.revenueAttributed ?? 0), 0)
  };
}

export function canCustomerReviewProduct(customerId: string, productId: string) {
  return productReviews.some(
    (review) => review.customerId === customerId && review.productId === productId && review.isVerifiedPurchase
  );
}

function averageFor(reviews: ProductReview[], key: "tasteRating" | "mixabilityRating" | "valueRating") {
  return reviews.length ? reviews.reduce((sum, review) => sum + review[key], 0) / reviews.length : 0;
}

function countBy<T, K extends ReviewModerationStatus | ProductQuestionThread["status"]>(
  rows: T[],
  select: (row: T) => K
) {
  return rows.reduce(
    (acc, row) => {
      const key = select(row);
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Partial<Record<K, number>>
  );
}
