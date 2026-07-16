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

  const downloadReport = async (report: ReportItem) => {
    // We will build a client-side print trigger or simple hidden iframe approach
    // For now, it will open the report with a print flag
    const url = `/reports/${report.id}?print=true`;
    window.open(url, "_blank");
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Voice of Customer"
        title="Enterprise Reports Dashboard"
        description="View generated analytics reports. Click into a report to explore interactive charts, sentiment trends, and granular feedback filters."
        action={
          !isViewer && (
            <Button onClick={handleGenerateReport} disabled={generating} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
              {generating ? "Generating..." : "Generate New Report"}
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
        <div className="text-center py-12 text-xs text-slate-400 font-semibold animate-pulse">
          Loading enterprise reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-16 text-center shadow-sm max-w-3xl mx-auto">
          <FileText className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <h3 className="font-extrabold text-lg text-slate-900">No reports generated yet</h3>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto font-medium">
            Generate an enterprise Voice of Customer report to unlock actionable insights, sentiment tracking, and interactive KPI dashboards.
          </p>
          {!isViewer && (
            <Button onClick={handleGenerateReport} disabled={generating} className="mt-6 font-bold bg-indigo-600 hover:bg-indigo-700">
              {generating ? "Generating..." : "Generate Your First Report"}
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col justify-between hover:shadow-lg transition-shadow duration-300 border border-slate-200/80">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="bg-indigo-50 p-3 rounded-2xl">
                    <FileText className="h-6 w-6 text-indigo-600" />
                  </div>
                  <Badge variant={report.status === "Ready" ? "green" : "amber"} className="uppercase font-extrabold tracking-wider text-[10px]">
                    {report.status}
                  </Badge>
                </div>
                
                <h2 className="text-lg font-black text-slate-900 leading-tight">
                  {report.title}
                </h2>
                <p className="mt-1.5 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  Generated {report.date}
                </p>
                
                <p className="mt-4 text-sm text-slate-600 leading-relaxed font-medium line-clamp-3">
                  {report.summary}
                </p>
              </CardContent>
              
              <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => downloadReport(report)}
                  className="text-xs font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 border-slate-200"
                >
                  Download PDF
                </Button>
                
                <Button 
                  size="sm"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
                  onClick={() => window.location.href = `/reports/${report.id}`}
                >
                  View Dashboard
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
