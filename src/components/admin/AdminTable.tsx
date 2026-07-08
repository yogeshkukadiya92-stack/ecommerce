import type { ReactNode } from "react";

export function AdminTable({
  columns,
  emptyText = "No live records yet.",
  rows
}: {
  columns: string[];
  emptyText?: string;
  rows: Array<ReactNode[]>;
}) {
  return (
    <div className="max-w-full overflow-hidden rounded-card border border-black/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-mist text-xs font-black uppercase tracking-[0.12em] text-slate">
            <tr>
              {columns.map((column) => (
                <th key={column} className="whitespace-nowrap px-4 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {rows.length > 0 ? rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white transition-colors hover:bg-mist/70">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-4 align-middle text-graphite first:font-semibold">
                    {cell}
                  </td>
                ))}
              </tr>
            )) : (
              <tr>
                <td className="px-4 py-10 text-center text-sm font-semibold text-slate" colSpan={columns.length}>
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
