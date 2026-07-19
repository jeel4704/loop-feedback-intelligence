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
    <Card>
      <CardContent className="overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-dark-card/50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.key}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-dark-muted"
                  >
                    {column.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-850 bg-white dark:bg-dark-bg">
              {rows.map((row, index) => (
                <tr key={index} className="align-top">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4 text-sm text-slate-700 dark:text-dark-secondaryText">
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

