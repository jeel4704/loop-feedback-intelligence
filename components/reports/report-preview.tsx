import { Badge, Card, CardContent } from "@/components/ui";

interface ReportPreviewProps {
  topThemes: string[];
  sentimentChanges: string[];
  customerQuotes: string[];
  recommendedActions: string[];
}

export function ReportPreview({
  topThemes,
  sentimentChanges,
  customerQuotes,
  recommendedActions
}: ReportPreviewProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-slate-950">
              Report Preview
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Snapshot of a Voice of Customer report before export.
            </p>
          </div>
          <Badge variant="indigo">Draft Ready</Badge>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Top themes
            </h4>
            <div className="mt-3 flex flex-wrap gap-2">
              {topThemes.map((theme) => (
                <Badge key={theme} variant="blue">
                  {theme}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Sentiment changes
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {sentimentChanges.map((change) => (
                <li key={change}>{change}</li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Customer quotes
            </h4>
            <ul className="mt-3 space-y-3 text-sm text-slate-700">
              {customerQuotes.map((quote) => (
                <li key={quote} className="rounded-2xl bg-slate-50 p-3">
                  “{quote}”
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Recommended actions
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {recommendedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

