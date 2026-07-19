"use client";

import { useRef, useState, useEffect } from "react";
import { Upload, CheckCircle2, XCircle, AlertTriangle, RefreshCw, Download } from "lucide-react";
import { Button, Card, CardContent } from "@/components/ui";
import Papa from "papaparse";
import { REQUIRED_COLUMNS, guessColumnMapping, enrichFeedbackData } from "@/lib/csv-utils";
import Link from "next/link";

type Step = "UPLOAD" | "PROGRESS" | "SUMMARY";

export function EnterpriseImporter() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State
  const [step, setStep] = useState<Step>("UPLOAD");
  const [importMode, setImportMode] = useState<"APPEND" | "REPLACE">("APPEND");
  const [file, setFile] = useState<File | null>(null);
  
  // Progress & Summary
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [progressPercent, setProgressPercent] = useState(0);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [showReplaceWarning, setShowReplaceWarning] = useState(false);

  const handleDownloadTemplate = () => {
    window.location.href = "/api/feedback/template";
  };

  const resetState = () => {
    setStep("UPLOAD");
    setFile(null);
    setProgressLog([]);
    setProgressPercent(0);
    setImportSummary(null);
    setErrorMessage("");
    setShowReplaceWarning(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Automated flow from raw rows directly to backend submission
  const executeAutomaticImport = async (selectedFile: File, rows: any[], mapping: Record<string, string>) => {
    setStep("PROGRESS");
    setProgressPercent(10);
    setProgressLog(["Validating CSV..."]);

    try {
      await new Promise(r => setTimeout(r, 600)); // Smooth UX transition
      setProgressPercent(20);
      setProgressLog(prev => [...prev, "Detecting columns..."]);

      await new Promise(r => setTimeout(r, 600));
      setProgressPercent(40);
      setProgressLog(prev => [...prev, "Processing feedback..."]);

      const items = rows.map(row => {
        const item: Record<string, string> = {};
        REQUIRED_COLUMNS.forEach(col => {
          const csvCol = mapping[col];
          item[col] = csvCol && row[csvCol] ? String(row[csvCol]) : "";
        });
        return enrichFeedbackData(item);
      }).filter(row => row.Feedback.length > 0);

      if (items.length === 0) {
        throw new Error("No valid records found. Ensure your file contains text in the feedback column.");
      }

      await new Promise(r => setTimeout(r, 600));
      setProgressPercent(60);
      setProgressLog(prev => [...prev, "Checking duplicates..."]);

      const res = await fetch("/api/feedback/enterprise-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items,
          importMode,
          fileName: selectedFile.name,
          fileSize: selectedFile.size
        })
      });

      const data = await res.json();
      
      setProgressPercent(80);
      setProgressLog(prev => [...prev, "Saving records & generating AI metadata..."]);

      if (!res.ok) {
        throw new Error(data.error || "Failed to import feedback items.");
      }

      await new Promise(r => setTimeout(r, 800));
      setProgressPercent(100);
      setProgressLog(prev => [...prev, "Updating analytics and dashboards..."]);
      
      setImportSummary(data);
      setTimeout(() => setStep("SUMMARY"), 1200);
      
    } catch (err: any) {
      setStep("UPLOAD"); // Return to start if failed
      setErrorMessage(err.message || "An unexpected error occurred during import.");
    }
  };

  const handleFileSelection = (selectedFile: File) => {
    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const rows = results.data as any[];
          if (!rows || rows.length === 0) {
            setErrorMessage("The CSV file is empty or corrupted.");
            return;
          }

          const headers = results.meta.fields || Object.keys(rows[0]);
          const mapping = guessColumnMapping(headers);
          
          if (!mapping["Feedback"]) {
            setErrorMessage("We couldn't recognize the feedback column in this file. Please use the official LOOP CSV template or ensure your file contains customer feedback.");
            return;
          }

          // File valid and successfully mapped. Immediately execute import automatically.
          executeAutomaticImport(selectedFile, rows, mapping);
          
        } catch (err: any) {
          setErrorMessage(err.message || "Failed to parse CSV file.");
        }
      },
      error: (error) => {
        setErrorMessage(`CSV Parsing Error: ${error.message}`);
      }
    });
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith(".csv")) {
      setErrorMessage("Please select a valid .csv file.");
      return;
    }

    setFile(selectedFile);
    setErrorMessage("");

    if (importMode === "APPEND") {
      handleFileSelection(selectedFile);
    } else {
      // In REPLACE mode, wait for user confirmation before parsing and executing.
      setShowReplaceWarning(true);
    }
  };

  const confirmDestructiveImport = () => {
    setShowReplaceWarning(false);
    if (file) handleFileSelection(file);
  };

  return (
    <Card className="border border-slate-200/80 shadow-sm rounded-3xl overflow-hidden bg-white dark:bg-dark-bg dark:border-dark-border">
      <CardContent className="p-0">
        
        {/* Header Ribbon */}
        <div className="bg-slate-50 dark:bg-dark-card/40 border-b border-slate-100 dark:border-dark-border p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Enterprise CSV Import</h2>
            <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted mt-1">Smart map, validate, and securely sync historic customer data.</p>
          </div>
          {step === "UPLOAD" && (
            <Button onClick={handleDownloadTemplate} variant="secondary" className="text-xs font-bold bg-white dark:bg-dark-elevated border-slate-200 dark:border-dark-border shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700">
              <Download className="h-4 w-4 mr-2 text-indigo-600 dark:text-indigo-400" />
              Download Official Template
            </Button>
          )}
          {step !== "UPLOAD" && step !== "PROGRESS" && step !== "SUMMARY" && (
             <Button onClick={resetState} variant="secondary" className="text-xs font-bold text-slate-600 dark:text-dark-muted">
               Cancel Import
             </Button>
          )}
        </div>

        <div className="p-6">
          
          {/* STEP 1: UPLOAD */}
          {step === "UPLOAD" && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
              
              {/* Import Mode Selection */}
              <div className="bg-white dark:bg-dark-card border border-slate-200 dark:border-dark-border rounded-2xl p-4">
                <p className="text-[10px] uppercase font-black text-slate-400 dark:text-dark-muted tracking-wider mb-3">Select Import Mode</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <label className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none ${importMode === "APPEND" ? "border-indigo-600 bg-indigo-50/50 dark:bg-indigo-900/20 dark:border-indigo-500 ring-1 ring-indigo-600 dark:ring-indigo-500" : "border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-hover"}`}>
                    <input type="radio" name="importMode" value="APPEND" className="sr-only" checked={importMode === "APPEND"} onChange={() => setImportMode("APPEND")} />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-bold text-slate-900 dark:text-slate-100">Append New Feedback</span>
                        <span className="mt-1 flex items-center text-xs font-medium text-slate-500 dark:text-dark-muted">Preserves existing records. Safe default.</span>
                      </span>
                    </span>
                    <CheckCircle2 className={`h-5 w-5 ${importMode === "APPEND" ? "text-indigo-600 dark:text-indigo-400" : "invisible"}`} />
                  </label>
                  
                  <label className={`relative flex cursor-pointer rounded-xl border p-4 shadow-sm focus:outline-none ${importMode === "REPLACE" ? "border-rose-600 bg-rose-50/50 dark:bg-rose-900/20 dark:border-rose-500 ring-1 ring-rose-600 dark:ring-rose-500" : "border-slate-200 dark:border-dark-border hover:bg-slate-50 dark:hover:bg-dark-hover"}`}>
                    <input type="radio" name="importMode" value="REPLACE" className="sr-only" checked={importMode === "REPLACE"} onChange={() => { setImportMode("REPLACE"); setFile(null); setShowReplaceWarning(false); }} />
                    <span className="flex flex-1">
                      <span className="flex flex-col">
                        <span className="block text-sm font-bold text-rose-900 dark:text-rose-100 flex items-center gap-1">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Replace Existing Dataset
                        </span>
                        <span className="mt-1 flex items-center text-xs font-medium text-rose-600/80 dark:text-rose-400">Deletes all current data. Use with caution.</span>
                      </span>
                    </span>
                    <CheckCircle2 className={`h-5 w-5 ${importMode === "REPLACE" ? "text-rose-600 dark:text-rose-400" : "invisible"}`} />
                  </label>
                </div>
              </div>

              {errorMessage && (
                <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-rose-500 shrink-0" />
                    <span className="text-sm font-semibold text-rose-700 dark:text-rose-400">{errorMessage}</span>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button onClick={handleDownloadTemplate} variant="secondary" className="bg-white dark:bg-dark-elevated text-xs text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/40 border-rose-200 dark:border-rose-900/60 font-bold">
                      Download Template
                    </Button>
                    <Button onClick={() => fileInputRef.current?.click()} className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm">
                      Choose Another File
                    </Button>
                  </div>
                </div>
              )}

              {/* Upload Dropzone */}
              {!showReplaceWarning && !errorMessage && (
                <div 
                  className="rounded-3xl border-2 border-dashed border-slate-300 dark:border-dark-border bg-slate-50/50 dark:bg-dark-card/30 p-12 text-center hover:bg-slate-50 dark:hover:bg-dark-elevated/50 transition cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={onFileInputChange} />
                  <div className="mx-auto w-12 h-12 bg-white dark:bg-dark-elevated shadow-sm rounded-2xl flex items-center justify-center border border-slate-100 dark:border-dark-border mb-4">
                    <Upload className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-slate-100">Click or drag CSV file to upload</p>
                  <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted mt-2">Supports large datasets via chunking (up to 50MB)</p>
                </div>
              )}

              {/* Destructive Warning */}
              {showReplaceWarning && file && (
                <div className="animate-in slide-in-from-bottom-4 duration-300 border-2 border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 p-8 rounded-3xl text-center">
                  <div className="mx-auto w-14 h-14 bg-white dark:bg-rose-900/50 shadow-sm rounded-full flex items-center justify-center border border-rose-100 dark:border-rose-800 mb-4 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="h-7 w-7" />
                  </div>
                  <h3 className="text-lg font-black text-rose-950 dark:text-rose-100 mb-2">Warning: Permanent Data Replacement</h3>
                  <p className="text-sm text-rose-700/90 dark:text-rose-400/90 font-medium max-w-md mx-auto mb-6">
                    This action will permanently delete all existing feedback records in the database before importing "{file.name}". This operation cannot be undone.
                  </p>
                  <div className="flex justify-center gap-3">
                    <Button onClick={resetState} variant="secondary" className="font-bold border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50">Cancel</Button>
                    <Button onClick={confirmDestructiveImport} className="bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-sm">Yes, Replace Data</Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PROGRESS */}
          {step === "PROGRESS" && (
            <div className="space-y-8 py-8 animate-in zoom-in-95 duration-300 max-w-md mx-auto text-center">
               <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                 <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
                 <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                   <circle cx="48" cy="48" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-slate-100 dark:text-slate-800" />
                   <circle cx="48" cy="48" r="45" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="283" strokeDashoffset={283 - (283 * progressPercent) / 100} className="text-indigo-600 transition-all duration-500 ease-out" />
                 </svg>
               </div>
               
               <div>
                 <h3 className="text-lg font-black text-slate-900 dark:text-slate-50">Processing Import...</h3>
                 <p className="text-xs font-semibold text-slate-500 dark:text-dark-muted mt-2">
                   {progressLog[progressLog.length - 1]}
                 </p>
               </div>

               <div className="h-2 w-full bg-slate-100 dark:bg-dark-elevated rounded-full overflow-hidden">
                 <div className="h-full bg-indigo-600 rounded-full transition-all duration-500 ease-out" style={{ width: `${progressPercent}%` }} />
               </div>
            </div>
          )}

          {/* STEP 3: SUMMARY */}
          {step === "SUMMARY" && importSummary && (
             <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
               <div className="p-6 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-3xl flex flex-col items-center text-center">
                 <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4">
                   <CheckCircle2 className="h-8 w-8" />
                 </div>
                 <h3 className="text-xl font-black text-emerald-950 dark:text-emerald-100">Import Completed Successfully</h3>
                 <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400/80 mt-1 max-w-sm">
                   Your enterprise feedback database has been synchronized. All analytical modules have been automatically updated.
                 </p>
               </div>

               <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 <div className="p-4 border border-slate-200 dark:border-dark-border rounded-2xl bg-white dark:bg-dark-bg text-center">
                   <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider">Total Rows</p>
                   <p className="text-2xl font-black text-slate-900 dark:text-slate-50 mt-1">{importSummary.total}</p>
                 </div>
                 <div className="p-4 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
                   <p className="text-[10px] uppercase font-black text-emerald-600 dark:text-emerald-400 tracking-wider">Imported</p>
                   <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">{importSummary.imported}</p>
                 </div>
                 <div className="p-4 border border-amber-200 dark:border-amber-900/50 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 text-center">
                   <p className="text-[10px] uppercase font-black text-amber-600 dark:text-amber-400 tracking-wider">Duplicates Skipped</p>
                   <p className="text-2xl font-black text-amber-700 dark:text-amber-300 mt-1">{importSummary.duplicates}</p>
                 </div>
                 <div className="p-4 border border-rose-200 dark:border-rose-900/50 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 text-center">
                   <p className="text-[10px] uppercase font-black text-rose-600 dark:text-rose-400 tracking-wider">Failed/Invalid</p>
                   <p className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">{importSummary.failed}</p>
                 </div>
               </div>

               <div className="flex justify-center gap-4 pt-4">
                 <Button onClick={resetState} variant="secondary" className="font-bold">Import Another File</Button>
                 <Link href="/inbox" className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-6 py-2 text-sm font-bold text-white hover:bg-indigo-700 shadow-sm transition">
                   Go to Feedback Inbox
                 </Link>
               </div>
             </div>
          )}

        </div>
      </CardContent>
    </Card>
  );
}
