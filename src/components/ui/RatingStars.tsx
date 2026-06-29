import { Star } from "lucide-react";

export function RatingStars({
  rating = 4.8,
  reviewCount
}: {
  rating?: number;
  reviewCount?: number;
}) {
  return (
    <div className="flex items-center gap-1 text-amber">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star
          key={index}
          className="h-3.5 w-3.5"
          fill={index < Math.round(rating) ? "currentColor" : "none"}
        />
      ))}
      <span className="ml-1 text-xs font-semibold text-slate">
        {rating.toFixed(1)}
        {reviewCount ? ` (${reviewCount})` : ""}
      </span>
    </div>
  );
}
