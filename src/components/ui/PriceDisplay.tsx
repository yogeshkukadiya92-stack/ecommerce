export function PriceDisplay({
  mrp,
  sellingPrice
}: {
  mrp: number;
  sellingPrice: number;
}) {
  const discount = Math.max(0, Math.round(((mrp - sellingPrice) / mrp) * 100));

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className="text-xl font-black text-ink">
        Rs {sellingPrice.toLocaleString("en-IN")}
      </span>
      {mrp > sellingPrice ? (
        <>
          <span className="text-sm font-semibold text-slate line-through">
            Rs {mrp.toLocaleString("en-IN")}
          </span>
          <span className="text-xs font-black text-coral">{discount}% off</span>
        </>
      ) : null}
    </div>
  );
}
