export function EmptyState({
  title,
  description,
  action
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-card border border-dashed border-black/15 bg-white p-8 text-center shadow-sm sm:p-10">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md border border-forest/10 bg-mint text-lg font-black text-forest shadow-sm">
        FS
      </div>
      <h2 className="text-lg font-extrabold tracking-tight text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
