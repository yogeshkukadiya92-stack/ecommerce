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
    <div className="rounded-card border border-dashed border-black/20 bg-white p-8 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-mint text-lg font-black text-forest">
        FS
      </div>
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
