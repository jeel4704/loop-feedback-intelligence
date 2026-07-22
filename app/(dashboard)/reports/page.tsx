"use client";

import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  SectionHeader
} from "@/components/ui";
import { FileText, Trash2, X, Calendar, Activity, ListTree, Database } from "lucide-react";
import { useSession } from "next-auth/react";

interface ReportItem {
  id: string;
  title: string;
  summary: string;
  status: string;
  date: string;
  stats?: {
    totalFeedback: number;
    positive: number;
    neutral: number;
    negative: number;
  };
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "VIEWER";
  const isViewer = userRole === "VIEWER";

  const [reports, setReports] = useState<ReportItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [deletingReportId, setDeletingReportId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [previewData, setPreviewData] = useState<any>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

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

  // Live preview effect
  useEffect(() => {
    if (isModalOpen && startDate && endDate) {
      setIsPreviewLoading(true);
      fetch(`/api/reports/preview?startDate=${startDate}&endDate=${endDate}`)
        .then(async (res) => {
          if (res.ok) {
            const data = await res.json();
            setPreviewData(data);
          }
        })
        .finally(() => setIsPreviewLoading(false));
    } else {
      setPreviewData(null);
    }
  }, [isModalOpen, startDate, endDate]);

  const handleOpenModal = () => {
    const today = new Date();
    const lastMonth = new Date();
    lastMonth.setDate(today.getDate() - 30);
    
    setEndDate(today.toISOString().split("T")[0]);
    setStartDate(lastMonth.toISOString().split("T")[0]);
    setIsModalOpen(true);
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) return;
    setError("");
    setGenerating(true);

    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ startDate, endDate })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate report.");
      }

      setIsModalOpen(false);
      fetchReports();
    } catch (err: any) {
      setError(err.message || "Failed to generate report.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingReportId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reports/${deletingReportId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete report");
      setReports(reports.filter(r => r.id !== deletingReportId));
    } catch (err: any) {
      setError(err.message || "Failed to delete report.");
    } finally {
      setIsDeleting(false);
      setDeletingReportId(null);
    }
  };

  return (
    <div className="space-y-6 relative">

      {/* Generate Report Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-dark-border flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-dark-border">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-600" /> Generate Voice of Customer Report
                </h2>
                <p className="text-sm font-medium text-slate-500 dark:text-dark-muted mt-1">
                  Create an immutable, date-filtered snapshot of customer feedback analytics.
                </p>
              </div>
              <button onClick={() => !generating && setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              
              {/* Date Range Selection */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Analysis Date Range</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-dark-muted mb-1 block">From Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input 
                        type="date" 
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-500 dark:text-dark-muted mb-1 block">To Date</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input 
                        type="date" 
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-dark-input border border-slate-200 dark:border-dark-border rounded-xl pl-9 pr-3 py-2 text-sm font-medium focus:ring-2 focus:ring-indigo-500 dark:text-white outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Preview */}
              <div>
                <label className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 block flex items-center justify-between">
                  <span>Live Data Preview</span>
                  {isPreviewLoading && <span className="text-xs font-semibold text-indigo-600 animate-pulse">Calculating...</span>}
                </label>
                
                <div className="bg-slate-50 dark:bg-dark-bg border border-slate-200 dark:border-dark-border rounded-xl p-5">
                  {!previewData && !isPreviewLoading ? (
                    <div className="text-center text-sm text-slate-500 py-4">Select a valid date range to preview records.</div>
                  ) : previewData ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-dark-border">
                        <div className="flex items-center gap-2">
                          <Database className="h-4 w-4 text-indigo-600" />
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Matching Feedback Records</span>
                        </div>
                        <span className="text-xl font-black text-slate-900 dark:text-white">{previewData.totalFeedback.toLocaleString()}</span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2">
                        <div className="bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-lg border border-emerald-100 dark:border-emerald-900/30">
                          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Positive</p>
                          <p className="text-lg font-black text-emerald-700 dark:text-emerald-500">{previewData.positive}</p>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neutral</p>
                          <p className="text-lg font-black text-slate-700 dark:text-slate-300">{previewData.neutral}</p>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-950/20 p-3 rounded-lg border border-rose-100 dark:border-rose-900/30">
                          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Negative</p>
                          <p className="text-lg font-black text-rose-700 dark:text-rose-500">{previewData.negative}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 pt-2 pb-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <ListTree className="h-3.5 w-3.5" /> {previewData.themesCount} Themes Found
                        </div>
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                          <FileText className="h-3.5 w-3.5" /> {previewData.duplicateCount} Duplicates
                        </div>
                      </div>

                      {/* Display Matching Imports */}
                      {previewData.matchingImports && previewData.matchingImports.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-dark-border">
                          <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-3 uppercase tracking-wider">Matching Datasets (Ingestion Date)</h4>
                          <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                            {previewData.matchingImports.map((imp: any) => (
                              <div key={imp.id} className="flex items-center justify-between bg-white dark:bg-dark-card border border-slate-100 dark:border-dark-border p-2 rounded-lg">
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]" title={imp.fileName}>{imp.fileName}</span>
                                  <span className="text-[10px] font-medium text-slate-500">{new Date(imp.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
                                </div>
                                <span className="text-xs font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-1 rounded-md">
                                  {imp.validRecords.toLocaleString()} records
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

            </div>
            
            <div className="p-6 border-t border-slate-100 dark:border-dark-border flex items-center justify-end gap-3 bg-slate-50/50 dark:bg-dark-elevated">
              <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={generating}>Cancel</Button>
              <Button onClick={handleGenerateReport} disabled={generating || !previewData || previewData.totalFeedback === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold">
                {generating ? "Generating Snapshot..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingReportId && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 print:hidden backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-sm border border-slate-200 dark:border-dark-border p-6 relative">
            <button onClick={() => !isDeleting && setDeletingReportId(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-white transition">
              <X className="h-5 w-5" />
            </button>
            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Delete this report?</h3>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-6">This action cannot be undone. Feedback, imports, and analytics will remain intact.</p>
            <div className="flex items-center gap-3 justify-end">
              <Button variant="secondary" onClick={() => setDeletingReportId(null)} disabled={isDeleting} className="text-xs font-bold">Cancel</Button>
              <Button onClick={handleDelete} disabled={isDeleting} className="text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white">
                {isDeleting ? "Deleting..." : "Delete Report"}
              </Button>
            </div>
          </div>
        </div>
      )}

      <SectionHeader
        eyebrow="Voice of Customer"
        title="Enterprise Reports Dashboard"
        description="View generated analytics reports. Click into a report to explore interactive charts, sentiment trends, and granular feedback filters."
        action={
          !isViewer && (
            <Button onClick={handleOpenModal} className="bg-brand hover:bg-brand-hover text-white font-bold">
              Generate New Report
            </Button>
          )
        }
      />

      {error && (
        <div className="rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 p-3 text-xs font-semibold text-rose-700 dark:text-rose-400 max-w-xl mx-auto">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12 text-xs text-slate-500 dark:text-dark-muted font-semibold animate-pulse">
          Loading enterprise reports...
        </div>
      ) : reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card p-16 text-center shadow-sm max-w-3xl mx-auto">
          <FileText className="h-12 w-12 text-slate-300 dark:text-dark-muted mx-auto mb-4" />
          <h3 className="font-extrabold text-lg text-slate-950 dark:text-white">No reports generated yet</h3>
          <p className="text-sm text-slate-500 dark:text-dark-muted mt-2 max-w-md mx-auto font-medium">
            Generate an enterprise Voice of Customer report to unlock actionable insights, sentiment tracking, and interactive KPI dashboards.
          </p>
          {!isViewer && (
            <Button onClick={handleOpenModal} className="mt-6 font-bold bg-brand hover:bg-brand-hover text-white">
              Generate Your First Report
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {reports.map((report) => (
            <Card key={report.id} className="flex flex-col justify-between hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:hover:shadow-[0_8px_30px_rgba(255,255,255,0.03)] transition-all duration-300 border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card rounded-2xl overflow-hidden group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-3 mb-5">
                  <div className="bg-slate-100 dark:bg-dark-elevated p-3 rounded-xl border border-slate-200 dark:border-dark-border group-hover:border-brand/30 transition-colors">
                    <FileText className="h-5 w-5 text-slate-700 dark:text-slate-300" />
                  </div>
                  <Badge variant={report.status === "Ready" ? "green" : "amber"} className="uppercase font-extrabold tracking-wider text-[10px]">
                    {report.status}
                  </Badge>
                </div>
                
                <h2 className="text-[17px] font-bold text-slate-900 dark:text-gray-100 leading-tight">
                  {report.title}
                </h2>
                <p className="mt-1.5 text-[11px] text-slate-500 dark:text-dark-muted font-bold uppercase tracking-wider">
                  Generated {report.date}
                </p>
                
                <p className="mt-4 text-sm text-slate-600 dark:text-gray-400 leading-relaxed font-medium line-clamp-3 min-h-[60px]">
                  {report.summary}
                </p>

                {report.stats && (
                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-dark-border space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-500 dark:text-dark-muted">Total Feedback</span>
                      <span className="font-bold text-slate-900 dark:text-white">{report.stats.totalFeedback.toLocaleString()}</span>
                    </div>
                    
                    {report.stats.totalFeedback > 0 ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-dark-muted">
                          <span className="text-emerald-600 dark:text-emerald-400">Pos {report.stats.positive}%</span>
                          <span className="text-slate-400 dark:text-slate-500">Neu {report.stats.neutral}%</span>
                          <span className="text-rose-600 dark:text-rose-400">Neg {report.stats.negative}%</span>
                        </div>
                        <div className="h-1.5 flex rounded-full overflow-hidden bg-slate-100 dark:bg-dark-elevated">
                          <div style={{ width: `${report.stats.positive}%` }} className="bg-emerald-500 dark:bg-emerald-400 transition-all" />
                          <div style={{ width: `${report.stats.neutral}%` }} className="bg-slate-300 dark:bg-slate-600 transition-all" />
                          <div style={{ width: `${report.stats.negative}%` }} className="bg-rose-500 dark:bg-rose-400 transition-all" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs font-semibold text-slate-400 dark:text-dark-muted italic">Not enough data</div>
                    )}
                  </div>
                )}
              </CardContent>
              
              <div className="p-4 border-t border-slate-100 dark:border-dark-border bg-slate-50/50 dark:bg-dark-elevated flex items-center justify-between gap-3">
                <Button 
                  className="flex-1 bg-slate-950 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-black text-xs font-bold shadow-sm py-2"
                  onClick={() => window.location.href = `/reports/${report.id}`}
                >
                  View Report
                </Button>

                {!isViewer && (
                  <button 
                    onClick={() => setDeletingReportId(report.id)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-dark-border bg-white dark:bg-dark-card hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-600 transition-colors shadow-sm"
                    title="Delete Report"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
