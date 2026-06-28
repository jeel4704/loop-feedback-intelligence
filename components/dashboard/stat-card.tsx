import { TrendingUp } from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui";

interface StatCardProps {
  label: string;
  value: string;
  delta: string;
  tone?: "blue" | "indigo" | "green" | "rose";
}

const toneMap = {
  blue: "bg-blue-100 text-blue-700",
  indigo: "bg-indigo-100 text-indigo-700",
  green: "bg-emerald-100 text-emerald-700",
  rose: "bg-rose-100 text-rose-700"
} as const;

export function StatCard({
  label,
  value,
  delta,
  tone = "blue"
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
            <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">
              {value}
            </p>
          </div>
          <div className={`rounded-2xl p-3 ${toneMap[tone]}`}>
            <TrendingUp className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-4">
          <Badge variant="outline">{delta}</Badge>
        </div>
      </CardContent>
    </Card>
  );
}
