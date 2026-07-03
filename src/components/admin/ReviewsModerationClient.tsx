"use client";

import { MessageSquareReply, Search, ShieldCheck, Star } from "lucide-react";
import { useMemo, useState } from "react";
import { productQuestions, productReviews } from "@/mock/engagement";
import { writeAdminAuditLog } from "@/lib/admin/auditLog";
import { showDemoData } from "@/lib/admin/liveData";
import { useAdminSession } from "@/lib/admin/useAdminSession";
import {
  getQuestionModerationCounts,
  getReviewModerationCounts,
  getReviewSummary
} from "@/lib/engagement/engagementService";
import type { ProductQuestionThread, ProductReview, QuestionModerationStatus, ReviewModerationStatus } from "@/types/engagement";
import { Badge } from "@/components/ui/Badge";
import { AdminCard } from "./AdminCard";
import { AdminTable } from "./AdminTable";
import { LiveAdminEmptyState } from "./LiveAdminEmptyState";

export function ReviewsModerationClient() {
  if (!showDemoData) {
    return (
      <LiveAdminEmptyState
        actionHref="/admin/settings"
        actionLabel="Configure reviews"
        title="Review moderation is waiting for live feedback"
        description="Sample product reviews and Q&A threads are hidden. Live customer reviews can be connected to this moderation workflow after launch."
      />
    );
  }

  return <DemoReviewsModerationClient />;
}

function DemoReviewsModerationClient() {
  const { session } = useAdminSession();
  const [activeTab, setActiveTab] = useState<"reviews" | "questions" | "summary">("reviews");
  const [reviewRows, setReviewRows] = useState(productReviews);
  const [questionRows, setQuestionRows] = useState(productQuestions);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState("");

  const reviewCounts = getReviewModerationCounts();
  const questionCounts = getQuestionModerationCounts();
  const filteredReviews = useMemo(
    () =>
      reviewRows.filter((review) =>
        [review.productName, review.customerName, review.title, review.comment, review.status]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [reviewRows, search]
  );
  const filteredQuestions = useMemo(
    () =>
      questionRows.filter((question) =>
        [question.productName, question.customerName, question.question, question.answer ?? "", question.status]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [questionRows, search]
  );

  function updateReviewStatus(reviewId: string, status: ReviewModerationStatus) {
    setReviewRows((current) => current.map((review) => (review.id === reviewId ? { ...review, status } : review)));
    audit("admin.review.moderate", "Review", reviewId, { status });
    setToast(`Review marked ${status}.`);
  }

  function replyToReview(reviewId: string) {
    setReviewRows((current) =>
      current.map((review) =>
        review.id === reviewId
          ? { ...review, adminReply: "Thanks for your review. We have noted your feedback." }
          : review
      )
    );
    audit("admin.review.reply", "Review", reviewId);
    setToast("Admin reply saved to review.");
  }

  function updateQuestionStatus(questionId: string, status: QuestionModerationStatus) {
    setQuestionRows((current) => current.map((question) => (question.id === questionId ? { ...question, status } : question)));
    audit("admin.question.moderate", "ProductQuestion", questionId, { status });
    setToast(`Question marked ${status}.`);
  }

  function answerQuestion(questionId: string) {
    setQuestionRows((current) =>
      current.map((question) =>
        question.id === questionId
          ? {
              ...question,
              answer: question.answer ?? "Follow the label directions and check product details before purchase.",
              answeredBy: session?.fullName ?? "FitSupplement Admin",
              answeredAt: new Date().toISOString(),
              isAdminAnswered: true,
              status: "answered"
            }
          : question
      )
    );
    audit("admin.question.answer", "ProductQuestion", questionId);
    setToast("Question answered and marked visible.");
  }

  function audit(action: string, entityType: string, entityId: string, metadata?: Record<string, unknown>) {
    writeAdminAuditLog(session, {
      action,
      entityId,
      entityType,
      metadata
    });
  }

  return (
    <div className="grid gap-6">
      {toast ? <Toast message={toast} onDismiss={() => setToast("")} /> : null}
      <div className="grid gap-4 md:grid-cols-4">
        <Metric label="Pending reviews" value={String(reviewCounts.pending ?? 0)} />
        <Metric label="Approved reviews" value={String(reviewCounts.approved ?? 0)} />
        <Metric label="Reported reviews" value={String(reviewCounts.reported ?? 0)} />
        <Metric label="Pending Q&A" value={String(questionCounts.pending ?? 0)} />
      </div>

      <AdminCard>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex gap-2 overflow-x-auto">
            {(["reviews", "questions", "summary"] as const).map((tab) => (
              <button
                className={`shrink-0 rounded-md px-3 py-2 text-sm font-black ${activeTab === tab ? "bg-ink text-white" : "bg-mist text-ink"}`}
                key={tab}
                onClick={() => setActiveTab(tab)}
                type="button"
              >
                {tab === "reviews" ? "Review moderation" : tab === "questions" ? "Product Q&A" : "Review summary"}
              </button>
            ))}
          </div>
          <label className="flex h-11 min-w-0 items-center gap-2 rounded-md border border-black/10 bg-white px-3 lg:w-80">
            <Search className="h-4 w-4 text-slate" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search reviews and Q&A"
              value={search}
            />
          </label>
        </div>
      </AdminCard>

      {activeTab === "reviews" ? (
        <AdminTable
          columns={["Review", "Product", "Ratings", "Status", "Media", "Actions"]}
          rows={filteredReviews.map((review) => [
            <ReviewCell key="review" review={review} />,
            review.productName,
            <div className="grid gap-1 text-xs font-bold" key="ratings">
              <span>Overall {review.rating}/5</span>
              <span>Taste {review.tasteRating}/5</span>
              <span>Mixability {review.mixabilityRating}/5</span>
              <span>Value {review.valueRating}/5</span>
            </div>,
            <Badge key="status" tone={review.status === "approved" ? "success" : review.status === "reported" ? "sale" : "neutral"}>{review.status}</Badge>,
            review.mediaPlaceholder,
            <div className="flex flex-wrap gap-2" key="actions">
              {(["approved", "pending", "rejected", "reported"] as ReviewModerationStatus[]).map((status) => (
                <button className="admin-action" key={status} onClick={() => updateReviewStatus(review.id, status)} type="button">{status}</button>
              ))}
              <button className="admin-action" onClick={() => replyToReview(review.id)} type="button">
                <MessageSquareReply className="h-4 w-4" /> Reply
              </button>
            </div>
          ])}
        />
      ) : null}

      {activeTab === "questions" ? (
        <AdminTable
          columns={["Question", "Product", "Answer", "Status", "Actions"]}
          rows={filteredQuestions.map((question) => [
            <QuestionCell key="question" question={question} />,
            question.productName,
            question.answer ?? "Pending admin answer",
            <Badge key="status" tone={question.status === "answered" ? "success" : question.status === "reported" ? "sale" : "neutral"}>{question.status}</Badge>,
            <div className="flex flex-wrap gap-2" key="actions">
              <button className="admin-action" onClick={() => answerQuestion(question.id)} type="button">Answer</button>
              {(["pending", "answered", "hidden", "reported"] as QuestionModerationStatus[]).map((status) => (
                <button className="admin-action" key={status} onClick={() => updateQuestionStatus(question.id, status)} type="button">{status}</button>
              ))}
            </div>
          ])}
        />
      ) : null}

      {activeTab === "summary" ? <ReviewSummaryGrid reviews={reviewRows} /> : null}
    </div>
  );
}

function ReviewSummaryGrid({ reviews }: { reviews: ProductReview[] }) {
  const products = [...new Map(reviews.map((review) => [review.productId, review.productName])).entries()];

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {products.map(([productId, productName]) => {
        const summary = getReviewSummary(reviews.filter((review) => review.productId === productId));
        return (
          <AdminCard key={productId} title={productName}>
            <div className="grid gap-3 sm:grid-cols-4">
              <Metric compact label="Average" value={summary.average.toFixed(1)} />
              <Metric compact label="Taste" value={summary.tasteAverage.toFixed(1)} />
              <Metric compact label="Mixability" value={summary.mixabilityAverage.toFixed(1)} />
              <Metric compact label="Value" value={summary.valueAverage.toFixed(1)} />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {summary.commonTags.map((tag) => <Badge key={tag}>{tag}</Badge>)}
            </div>
            <p className="mt-4 text-sm font-semibold text-slate">Review request trigger after delivery is enabled for this product.</p>
          </AdminCard>
        );
      })}
    </div>
  );
}

function ReviewCell({ review }: { review: ProductReview }) {
  return (
    <div className="max-w-md">
      <div className="flex flex-wrap gap-2">
        {review.isVerifiedPurchase ? <Badge tone="success"><ShieldCheck className="h-3 w-3" /> Verified purchase</Badge> : null}
        {review.reportedReason ? <Badge tone="sale">{review.reportedReason}</Badge> : null}
      </div>
      <p className="mt-2 font-black text-ink">{review.title}</p>
      <p className="mt-1 text-sm leading-6 text-slate">{review.comment}</p>
      <p className="mt-2 text-xs font-bold text-slate">{review.customerName}</p>
      {review.adminReply ? <p className="mt-2 rounded-md bg-mint p-2 text-xs font-bold text-forest">Admin reply: {review.adminReply}</p> : null}
    </div>
  );
}

function QuestionCell({ question }: { question: ProductQuestionThread }) {
  return (
    <div className="max-w-md">
      <p className="font-black text-ink">{question.question}</p>
      <p className="mt-2 text-xs font-bold text-slate">{question.customerName}</p>
      {question.isAdminAnswered ? <Badge tone="success">Answered badge</Badge> : null}
    </div>
  );
}

function Metric({ compact, label, value }: { compact?: boolean; label: string; value: string }) {
  return (
    <div className={`rounded-card border border-black/10 bg-white ${compact ? "p-3" : "p-5"} shadow-sm`}>
      <p className="text-xs font-black uppercase tracking-[0.14em] text-slate">{label}</p>
      <p className={`${compact ? "text-xl" : "text-3xl"} mt-2 font-black text-ink`}>{value}</p>
    </div>
  );
}

function Toast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <div className="fixed right-4 top-20 z-50 flex max-w-sm items-start gap-3 rounded-card border border-black/10 bg-white p-4 text-sm font-bold text-ink shadow-card">
      <Star className="h-5 w-5 text-forest" />
      <span>{message}</span>
      <button className="ml-auto text-slate" onClick={onDismiss} type="button">Dismiss</button>
    </div>
  );
}
