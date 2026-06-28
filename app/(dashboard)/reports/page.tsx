"use client";

import { useState } from "react";
import { ReportPreview } from "@/components/reports";
import {
  Badge,
  Button,
  Card,
  CardContent,
  Input,
  SectionHeader
} from "@/components/ui";
import { demoReports } from "@/data/reports";

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState(demoReports[0]);

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Voice of Customer"
        title="Generate and review customer insight reports"
        description="Create polished VOC summaries with theme movement, sentiment shifts, customer quotes, and recommended product actions."
        action={<Button>Generate Voice of Customer Report</Button>}
      />

      <Card>
        <CardContent className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">Start date</p>
            <Input type="date" defaultValue="2026-06-01" />
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-slate-700">End date</p>
            <Input type="date" defaultValue="2026-06-28" />
          </div>
          <div className="flex items-end">
            <Button fullWidth>Refresh preview</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-6">
          {demoReports.map((report) => (
            <button
              key={report.id}
              type="button"
              className="block w-full text-left"
              onClick={() => setSelectedReport(report)}
            >
            <Card className={selectedReport.id === report.id ? "ring-2 ring-blue-200 dark:ring-blue-900" : ""}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
                      {report.title}
                    </h2>
                    <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      {report.dateRange}
                    </p>
                  </div>
                  <Badge variant={report.status === "READY" ? "green" : "amber"}>
                    {report.status}
                  </Badge>
                </div>
                <p className="mt-4 text-sm text-slate-600 dark:text-slate-400">
                  {report.sentimentSummary}
                </p>
              </CardContent>
            </Card>
            </button>
          ))}
        </div>

        <ReportPreview
          topThemes={selectedReport.topThemes}
          sentimentChanges={[
            selectedReport.sentimentSummary,
            `Generated for ${selectedReport.dateRange}.`
          ]}
          customerQuotes={selectedReport.customerQuotes}
          recommendedActions={selectedReport.recommendedActions}
        />
      </div>
    </div>
  );
}
