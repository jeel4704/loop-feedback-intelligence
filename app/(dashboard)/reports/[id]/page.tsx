"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  SectionHeader,
  Badge,
  Button
} from "@/components/ui";
import { ExecutivePDFReport } from "./executive-pdf-report";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";
import {
  ArrowLeft,
  Download,
  TrendingUp,
  MessageSquareQuote,
  Activity,
  ThumbsUp,
  ThumbsDown,
  MinusCircle
} from "lucide-react";

interface ReportData {
  report: {
    id: string;
    title: string;
    summary: string;
    date: string;
    status: string;
  };
  kpis: {
    totalFeedback: number;
    positiveFeedback: number;
    negativeFeedback: number;
    neutralFeedback: number;
  };
  themes: {
    id: string;
    name: string;
    count: number;
    growth: number;
  }[];
  trend: {
    date: string;
    total: number;
    positive: number;
    negative: number;
  }[];
  quotes: {
    id: string;
    content: string;
    customerName: string;
    sentimentLabel: string;
  }[];
}

const COLORS = ["#10b981", "#ef4444", "#64748b"]; // Positive, Negative, Neutral

export default function ReportDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const reportId = params.id as string;
  const isPrint = searchParams.get("print") === "true";

  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/reports/${reportId}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Report not found");
        const json = await res.json();
        setData(json);
      })
      .catch((err) => {
        setError(err.message || "Failed to load report data.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [reportId]);

  useEffect(() => {
    if (isPrint && !loading && data) {
      setTimeout(() => {
        window.print();
      }, 1000);
    }
  }, [isPrint, loading, data]);

  if (loading) {
    return <div className="p-12 text-center text-sm font-semibold text-slate-400 animate-pulse">Loading interactive dashboard...</div>;
  }

  if (error || !data) {
    return <div className="p-12 text-center text-sm font-semibold text-rose-500 bg-rose-50 rounded-2xl">{error}</div>;
  }

  if (isPrint) {
    return <ExecutivePDFReport data={data} />;
  }

  const sentimentData = [
    { name: "Positive", value: data.kpis.positiveFeedback },
    { name: "Negative", value: data.kpis.negativeFeedback },
    { name: "Neutral", value: data.kpis.neutralFeedback },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => router.push("/reports")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 dark:text-dark-muted hover:text-slate-900 dark:hover:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </button>
        <Button 
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2 shadow-sm rounded-xl px-4 py-2"
        >
          <Download className="h-4 w-4" /> Download PDF Report
        </Button>
      </div>

      {/* Header section */}
      <div className="bg-white dark:bg-dark-card p-8 rounded-2xl border border-slate-200 dark:border-dark-border shadow-sm">
        <div className="flex items-center gap-4 mb-4">
          <Badge variant={data.report.status === "Ready" ? "green" : "amber"} className="uppercase font-extrabold tracking-wider">
            {data.report.status}
          </Badge>
          <span className="text-xs font-bold text-slate-400">Generated on {data.report.date}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mb-5">{data.report.title}</h1>
        
        {/* Executive AI Summary */}
        <div className="bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl p-5">
          <h3 className="text-sm font-bold text-indigo-900 dark:text-indigo-400 mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600 dark:text-indigo-400" /> Executive AI Summary
          </h3>
          <p className="text-[13px] text-indigo-800 dark:text-indigo-200/80 leading-relaxed font-medium">
            {data.report.summary}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border shadow-sm">
          <CardContent className="p-5">
            <p className="text-[11px] font-black text-slate-400 dark:text-dark-muted uppercase tracking-wider">Total Feedback</p>
            <h3 className="text-[28px] font-black text-slate-900 dark:text-white mt-1.5 leading-none">{data.kpis.totalFeedback.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-100 dark:border-emerald-900/30 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[11px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-wider flex items-center gap-1.5">
              <ThumbsUp className="h-3 w-3" /> Positive
            </p>
            <h3 className="text-[28px] font-black text-emerald-700 dark:text-emerald-400 mt-1.5 leading-none">{data.kpis.positiveFeedback.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-rose-50/50 dark:bg-rose-950/10 border-rose-100 dark:border-rose-900/30 shadow-sm">
          <CardContent className="p-5">
            <p className="text-[11px] font-black text-rose-600 dark:text-rose-500 uppercase tracking-wider flex items-center gap-1.5">
              <ThumbsDown className="h-3 w-3" /> Negative
            </p>
            <h3 className="text-[28px] font-black text-rose-700 dark:text-rose-400 mt-1.5 leading-none">{data.kpis.negativeFeedback.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border shadow-sm">
          <CardContent className="p-5">
            <p className="text-[11px] font-black text-slate-500 dark:text-dark-muted uppercase tracking-wider flex items-center gap-1.5">
              <MinusCircle className="h-3 w-3" /> Neutral
            </p>
            <h3 className="text-[28px] font-black text-slate-700 dark:text-slate-300 mt-1.5 leading-none">{data.kpis.neutralFeedback.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Trend Graph */}
        <Card className="bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Feedback Volume Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.15} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { weekday: "short" })} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b", fontWeight: 600 }} />
                  <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }} />
                  <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} name="Positive" />
                  <Line type="monotone" dataKey="negative" stroke="#f43f5e" strokeWidth={3} dot={{ r: 4, strokeWidth: 2, fill: "#fff" }} activeDot={{ r: 6 }} name="Negative" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card className="bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-4">Sentiment Mix</h3>
            <div className="h-56">
              {sentimentData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none", backgroundColor: "rgba(255,255,255,0.95)", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }} />
                    <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-400 font-bold">No sentiment data</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Themes */}
        <Card className="bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-brand" /> Top Discussion Themes
            </h3>
            {data.themes.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-dark-bg rounded-xl border border-dashed border-slate-200 dark:border-dark-border">
                <p className="text-xs text-slate-500 dark:text-dark-muted font-bold">No themes detected yet.</p>
              </div>
            ) : (
              <ul className="space-y-4">
                {data.themes.map((theme) => (
                  <li key={theme.id} className="flex items-center justify-between border-b border-slate-100 dark:border-dark-border pb-3 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3.5">
                      <div className="h-9 w-9 rounded-xl bg-indigo-50 dark:bg-brand/10 border border-indigo-100 dark:border-brand/20 flex items-center justify-center text-xs font-black text-indigo-600 dark:text-brand shadow-sm">
                        {theme.count}
                      </div>
                      <span className="font-bold text-[13px] text-slate-800 dark:text-slate-100">{theme.name}</span>
                    </div>
                    <Badge variant="green" className="font-bold text-[10px] uppercase tracking-wider">+{theme.growth}%</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Customer Quotes */}
        <Card className="bg-white dark:bg-dark-card border-slate-200 dark:border-dark-border shadow-sm">
          <CardContent className="p-6">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest mb-5 flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4 text-brand" /> Notable Feedback
            </h3>
            {data.quotes.length === 0 ? (
              <div className="py-8 text-center bg-slate-50 dark:bg-dark-bg rounded-xl border border-dashed border-slate-200 dark:border-dark-border">
                <p className="text-xs text-slate-500 dark:text-dark-muted font-bold">No notable quotes to display.</p>
              </div>
            ) : (
              <ul className="space-y-3">
                {data.quotes.map((quote) => (
                  <li key={quote.id} className="bg-slate-50 dark:bg-dark-bg p-4 rounded-xl border border-slate-200 dark:border-dark-border shadow-sm">
                    <p className="text-[13px] text-slate-700 dark:text-slate-200 italic font-medium leading-relaxed font-serif">"{quote.content}"</p>
                    <div className="flex justify-between mt-3 items-center border-t border-slate-200 dark:border-dark-border pt-2.5">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-dark-muted">Customer: {quote.customerName}</span>
                      <Badge variant={quote.sentimentLabel?.toLowerCase() === "positive" ? "green" : quote.sentimentLabel?.toLowerCase() === "negative" ? "rose" : "slate"} className="text-[9px] uppercase tracking-wider">
                        {quote.sentimentLabel}
                      </Badge>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
