import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui";

interface TableColumn {
  key: string;
  label: string;
}

interface DataTableProps {
  columns: TableColumn[];
  rows: ReactNode[][];
}

export function DataTable({ columns, rows }: DataTableProps) {
  return (
    <Card className="border border-slate-200 dark:border-dark-border shadow-sm rounded-2xl overflow-hidden bg-white dark:bg-dark-card">
      <CardContent className="overflow-hidden p-0">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-dark-border">
            <thead className="bg-slate-50 dark:bg-dark-elevated">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-5 py-3.5 text-left text-[11px] font-black uppercase tracking-[0.15em] text-slate-500 dark:text-dark-muted border-b border-slate-200 dark:border-dark-border"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-dark-border bg-white dark:bg-dark-card">
              {rows.map((row, index) => (
                <tr key={index} className="align-top hover:bg-slate-50/80 dark:hover:bg-dark-hover transition-colors duration-150">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-5 py-4 text-[13px] text-slate-700 dark:text-gray-300">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

