export function AdminModulePlaceholder({
  title,
  description,
  modules
}: {
  title: string;
  description: string;
  modules: string[];
}) {
  return (
    <section className="rounded-lg border border-black/10 bg-white p-5 shadow-sm">
      <h2 className="text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-graphite">{description}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {modules.map((module) => (
          <div key={module} className="rounded-md border border-black/10 bg-mist p-4">
            <p className="text-sm font-semibold text-ink">{module}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
