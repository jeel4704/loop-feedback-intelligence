import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({
  title,
  description,
  action
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-start gap-4 p-8">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">{title}</h3>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{description}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}
