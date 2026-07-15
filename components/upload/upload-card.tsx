"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, XCircle } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import Papa from "papaparse";

export function UploadCard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [importSummary, setImportSummary] = useState<{
    total: number;
    imported: number;
    duplicates: number;
    failed: number;
    report: any[];
  } | null>(null);
  const [showReportList, setShowReportList] = useState(false);

  const handleButtonClick = () => {
    setSuccessMessage("");
    setErrorMessage("");
    setImportSummary(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verify it is a CSV file
    if (!file.name.endsWith(".csv")) {
      setErrorMessage("Please select a valid .csv file.");
      return;
    }

    setLoading(true);
    setSuccessMessage("");
    setErrorMessage("");
    setImportSummary(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const rawRows = results.data as any[];
          
          if (!rawRows || rawRows.length === 0) {
            throw new Error("The CSV file is empty.");
          }

          // Map headers case-insensitively to database fields
          const items = rawRows
            .map((row) => {
              const keys = Object.keys(row);
              const contentKey = keys.find(
                (k) =>
                  k.toLowerCase() === "content" || k.toLowerCase() === "feedback"
              );
              const titleKey = keys.find((k) => k.toLowerCase() === "title");
              const nameKey = keys.find(
                (k) =>
                  k.toLowerCase() === "customername" ||
                  k.toLowerCase() === "name" ||
                  k.toLowerCase() === "customer name"
              );
              const emailKey = keys.find(
                (k) =>
                  k.toLowerCase() === "customeremail" ||
                  k.toLowerCase() === "email" ||
                  k.toLowerCase() === "customer email"
              );
              const themeKey = keys.find(
                (k) =>
                  k.toLowerCase() === "theme" ||
                  k.toLowerCase() === "category"
              );
              const channelKey = keys.find(
                (k) =>
                  k.toLowerCase() === "channel" ||
                  k.toLowerCase() === "source"
              );
              const statusKey = keys.find(
                (k) =>
                  k.toLowerCase() === "status" ||
                  k.toLowerCase() === "state"
              );
 
              let finalContent = contentKey ? String(row[contentKey]).trim() : "";
              let title = titleKey ? String(row[titleKey]).trim() : "";
              let customerName = nameKey ? String(row[nameKey]).trim() : "";
              let customerEmail = emailKey ? String(row[emailKey]).trim() : "";
              let theme = themeKey ? String(row[themeKey]).trim() : "";
              let channel = channelKey ? String(row[channelKey]).trim() : "CSV";
              let status = statusKey ? String(row[statusKey]).trim() : "New";
 
              // Intelligent Name & Message extraction from content (e.g., "Edward Parker: Need dark mode")
              if (finalContent && !customerName && finalContent.includes(":")) {
                const colonIndex = finalContent.indexOf(":");
                const prefix = finalContent.substring(0, colonIndex).trim();
                const suffix = finalContent.substring(colonIndex + 1).trim();
 
                const wordCount = prefix.split(/\s+/).length;
                if (
                  wordCount >= 1 &&
                  wordCount <= 4 &&
                  prefix.length > 2 &&
                  prefix.length < 30 &&
                  !prefix.includes("/") &&
                  !prefix.includes("@") &&
                  !prefix.includes("http")
                ) {
                  customerName = prefix;
                  finalContent = suffix;
                  if (!customerEmail) {
                    customerEmail = `${customerName.toLowerCase().replace(/\s+/g, ".")}@customer.com`;
                  }
                }
              }
 
              return {
                content: finalContent,
                title,
                customerName,
                customerEmail,
                theme,
                channel,
                status
              };
            })
            .filter((row) => row.content.length > 0);

          if (items.length === 0) {
            throw new Error(
              "No valid feedback entries found. Ensure your CSV contains a column named 'content' or 'feedback'."
            );
          }

          // Send to the backend endpoint
          const res = await fetch("/api/feedback/import", {
  credentials: "include",
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items })
          });

          const data = await res.json();

          if (!res.ok) {
            throw new Error(data.error || "Failed to import feedback items.");
          }

          setImportSummary({
            total: data.total,
            imported: data.imported,
            duplicates: data.duplicates,
            failed: data.failed,
            report: data.report || []
          });
          setSuccessMessage("CSV Import Completed");
          
          // Clear file input value
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        } catch (err: any) {
          setErrorMessage(err.message || "Failed to process CSV file.");
        } finally {
          setLoading(false);
        }
      },
      error: (error) => {
        setErrorMessage(`CSV Parsing Error: ${error.message}`);
        setLoading(false);
      }
    });
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-blue-100 p-3 text-blue-700">
            <Upload className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-slate-950">CSV Upload</h3>
            <p className="mt-2 text-sm text-slate-600">
              Upload a historical spreadsheet export to bootstrap your
              feedback inbox for analysis.
            </p>

             {successMessage && importSummary && (
              <div className="mt-4 p-5 bg-emerald-50 border border-emerald-200 rounded-3xl space-y-4 text-emerald-800 animate-in fade-in duration-200">
                <h4 className="text-sm font-bold text-emerald-950">CSV Import Completed Successfully</h4>
                
                <div className="border-t border-b border-emerald-200/60 py-3 space-y-1.5 text-xs font-semibold">
                  <div className="flex justify-between">
                    <span>Total Records</span>
                    <span className="font-extrabold text-emerald-950">{importSummary.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Imported Successfully</span>
                    <span className="font-extrabold text-emerald-950">{importSummary.imported}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicate Records Found</span>
                    <span className="font-extrabold text-emerald-950">{importSummary.duplicates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Duplicates Skipped</span>
                    <span className="font-extrabold text-emerald-950">{importSummary.duplicates}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Failed Records</span>
                    <span className="font-extrabold text-emerald-950">{importSummary.failed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Occurrence Counts Updated</span>
                    <span className="font-extrabold text-emerald-950">{importSummary.duplicates}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => setShowReportList(!showReportList)}
                    className="w-full text-xs font-bold bg-white text-emerald-900 border border-emerald-200 hover:bg-emerald-100"
                  >
                    {showReportList ? "Hide Import Report" : "View Import Report"}
                  </Button>

                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      const headers = [
                        "Incoming Feedback",
                        "Matched Feedback ID",
                        "Customer",
                        "Similarity Score",
                        "Theme",
                        "Status",
                        "Action Taken",
                        "Skipped Reason",
                        "Timestamp"
                      ];
                      const rows = importSummary.report.map((r: any) => [
                        `"${r.feedback.replace(/"/g, '""')}"`,
                        `"${r.matchedFeedbackId}"`,
                        `"${r.customer}"`,
                        r.similarityScore.toFixed(2),
                        `"${r.theme}"`,
                        `"${r.status}"`,
                        `"${r.actionTaken}"`,
                        `"${r.skippedReason}"`,
                        `"${r.timestamp}"`
                      ]);
                      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
                      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement("a");
                      link.setAttribute("href", url);
                      link.setAttribute("download", "duplicate_feedback_report.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="w-full text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    Download CSV Report
                  </Button>

                  <Button
                    variant="secondary"
                    type="button"
                    onClick={() => {
                      setImportSummary(null);
                      setSuccessMessage("");
                    }}
                    className="w-full text-xs font-bold border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                  >
                    Close
                  </Button>
                </div>

                {showReportList && importSummary.report.length > 0 && (
                  <div className="mt-3 p-3 bg-white border border-slate-200 rounded-2xl max-h-60 overflow-y-auto space-y-2 text-slate-700">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Skipped Duplicates Log</span>
                    {importSummary.report.map((r: any, idx: number) => (
                      <div key={idx} className="p-2 border border-slate-100 rounded-xl bg-slate-50 space-y-1 text-[11px] leading-relaxed">
                        <div><span className="font-bold text-slate-900">Feedback:</span> "{r.feedback}"</div>
                        <div className="grid grid-cols-2 gap-1 text-[10px] text-slate-500 font-semibold mt-1">
                          <div>Matched ID: <span className="text-slate-700">#{r.matchedFeedbackId.substring(0, 8)}</span></div>
                          <div>Customer: <span className="text-slate-700">{r.customer}</span></div>
                          <div>Theme: <span className="text-slate-700">{r.theme}</span></div>
                          <div>Reason: <span className="text-slate-700">{r.skippedReason}</span></div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {errorMessage && (
              <div className="mt-4 rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs font-semibold text-rose-700 flex items-center gap-2">
                <XCircle className="h-4 w-4 text-rose-500 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".csv"
                onChange={handleFileChange}
              />
              <p className="text-sm text-slate-600">
                Choose a local .csv file to import
              </p>
              <Button
                variant="secondary"
                className="mt-4 font-semibold"
                onClick={handleButtonClick}
                disabled={loading}
              >
                {loading ? "Importing..." : "Choose CSV"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
