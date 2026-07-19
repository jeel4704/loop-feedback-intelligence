"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui";
import { Clock, FileSpreadsheet, CheckCircle2, XCircle } from "lucide-react";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo`;
  return `${Math.floor(months / 12)}y`;
}

export function ImportHistory() {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/feedback/import-history")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setHistory(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="p-4 text-center text-xs text-slate-500 font-semibold animate-pulse">Loading import history...</div>;
  }

  if (history.length === 0) {
    return <div className="p-6 text-center text-xs text-slate-500 font-semibold bg-slate-50 dark:bg-dark-card/40 rounded-2xl border border-slate-100 dark:border-dark-border">No import history found.</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 px-2">Recent Imports Log</h3>
      <div className="space-y-3">
        {history.map((record) => (
          <Card key={record.id} className="border border-slate-200/80 dark:border-dark-border shadow-sm rounded-2xl bg-white dark:bg-dark-bg overflow-hidden">
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-indigo-50 dark:bg-indigo-900/30 p-2.5 rounded-xl border border-indigo-100 dark:border-indigo-800">
                    <FileSpreadsheet className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">{record.fileName}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-dark-muted flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {timeAgo(record.createdAt)} ago
                      </p>
                      <span className="text-[10px] text-slate-300 dark:text-slate-600">•</span>
                      <p className="text-[10px] font-semibold text-slate-500 dark:text-dark-muted">By {record.user?.name || record.user?.email || "User"}</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 items-center">
                   <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Imported</p>
                     <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{record.validRecords}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Skipped</p>
                     <p className="text-sm font-black text-amber-600 dark:text-amber-400">{record.invalidRecords}</p>
                   </div>
                   <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Status</p>
                     <p className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 ${record.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400'}`}>
                       {record.status}
                     </p>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
