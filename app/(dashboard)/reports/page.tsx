"use client";

import { useEffect, useState } from "react";
import { ReportPreview } from "@/components/reports";
import {
  Badge,
  Button,
  Card,
  CardContent,
  SectionHeader
} from "@/components/ui";
import { FileText } from "lucide-react";
import { useSession } from "next-auth/react";

interface ReportItem {
  id: string;
  title: string;
  summary: string;
  status: string;
  date: string;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "VIEWER";
  const isViewer = userRole === "VIEWER";

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  const fetchReports = () => {
    fetch("/api/reports")
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setReports(data.items || []);
      })
      .catch(() => {})
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerateReport = async () => {
    setError("");
    setGenerating(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate report.");
      }

      fetchReports();
    } catch (err: any) {
      setError(err.message || "Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Voice of Customer"
        title="Generate and review customer insight reports"
        description="Create polished VOC summaries with theme movement, sentiment shifts, customer quotes, and recommended product actions."
        action={
          !isViewer && (
            <Button onClick={handleGenerateReport} disabled={generating}>
              {generating ? "Generating..." : "Generate Voice of Customer Report"}
            </Button>
          )
        }
      />

      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 max-w-xl mx-auto">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-400 font-semibold">
          Loading workspace reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <FileText className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-900">No reports have been generated</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Create dynamic executive summaries detailing customer support wins and feature requests when feedback is imported.
          </p>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-bold text-slate-950">
                        {report.title}
                      </h2>
                      <p className="mt-2 text-xs text-slate-500 font-semibold">{report.date}</p>
                    </div>
                    <Badge variant={report.status === "Ready" ? "green" : "amber"}>
                      {report.status}
                    </Badge>
                  </div>
                  <p className="mt-4 text-xs text-slate-600 leading-relaxed font-medium">
                    {report.summary}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <ReportPreview
            topThemes={["Support speed", "Onboarding friction", "Billing clarity"]}
            sentimentChanges={[
              "Positive sentiment increased 11 points for support speed.",
              "Onboarding friction became the top negative theme this week."
            ]}
            customerQuotes={[
              "The support team resolved my issue in under ten minutes.",
              "I had to repeat steps in onboarding before import finally worked."
            ]}
            recommendedActions={[
              "Simplify the onboarding checklist for first-time users.",
              "Clarify team seat pricing in upgrade and billing surfaces.",
              "Turn support workflow wins into onboarding guidance."
            ]}
          />
        </div>
      )}
    </div>
  );
}
