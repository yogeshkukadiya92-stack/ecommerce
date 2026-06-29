export function LoadingState({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-40 items-center justify-center rounded-card border border-black/10 bg-white shadow-sm">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-graphite border-t-transparent" />
      <span className="ml-3 text-sm font-medium text-graphite">{label}</span>
    </div>
  );
}
