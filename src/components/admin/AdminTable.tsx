import type { ReactNode } from "react";

export function AdminTable({
  columns,
  rows
}: {
  columns: string[];
  rows: Array<ReactNode[]>;
}) {
  return (
    <div className="max-w-full overflow-hidden rounded-card border border-black/10 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-mist text-xs font-black uppercase tracking-[0.12em] text-slate">
            <tr>
              {columns.map((column) => (
                <th key={column} className="px-4 py-3">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="bg-white">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="px-4 py-4 text-graphite">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
