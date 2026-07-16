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

const COLORS = ["#10b981", "#ef4444", "#94a3b8"]; // Positive, Negative, Neutral

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

  const sentimentData = [
    { name: "Positive", value: data.kpis.positiveFeedback },
    { name: "Negative", value: data.kpis.negativeFeedback },
    { name: "Neutral", value: data.kpis.neutralFeedback },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6 print:space-y-4 print:bg-white print:text-black">
      {/* Hide navigation elements when printing */}
      <div className="flex items-center justify-between print:hidden">
        <button 
          onClick={() => router.push("/reports")}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Reports
        </button>
        <Button 
          onClick={() => window.print()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold flex items-center gap-2"
        >
          <Download className="h-4 w-4" /> Download PDF
        </Button>
      </div>

      {/* Header section */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm print:shadow-none print:border-none print:p-0">
        <div className="flex items-center gap-4 mb-4">
          <Badge variant={data.report.status === "Ready" ? "green" : "amber"} className="uppercase font-extrabold tracking-wider">
            {data.report.status}
          </Badge>
          <span className="text-xs font-bold text-slate-400">Generated on {data.report.date}</span>
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-4">{data.report.title}</h1>
        
        {/* Executive AI Summary */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-5 print:bg-transparent print:border-l-4 print:border-indigo-600 print:rounded-none">
          <h3 className="text-sm font-bold text-indigo-900 mb-2 flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-600" /> Executive AI Summary
          </h3>
          <p className="text-sm text-indigo-800 leading-relaxed font-medium">
            {data.report.summary}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
        <Card className="print:shadow-none print:border-slate-300">
          <CardContent className="p-5">
            <p className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">Total Feedback</p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data.kpis.totalFeedback.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-slate-300">
          <CardContent className="p-5">
            <p className="text-[11px] font-extrabold text-emerald-500 uppercase tracking-wider flex items-center gap-1">
              <ThumbsUp className="h-3 w-3" /> Positive
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data.kpis.positiveFeedback.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-slate-300">
          <CardContent className="p-5">
            <p className="text-[11px] font-extrabold text-rose-500 uppercase tracking-wider flex items-center gap-1">
              <ThumbsDown className="h-3 w-3" /> Negative
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data.kpis.negativeFeedback.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="print:shadow-none print:border-slate-300">
          <CardContent className="p-5">
            <p className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <MinusCircle className="h-3 w-3" /> Neutral
            </p>
            <h3 className="text-2xl font-black text-slate-900 mt-1">{data.kpis.neutralFeedback.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px] print:grid-cols-[1fr_300px] print:gap-4">
        {/* Trend Graph */}
        <Card className="print:shadow-none print:border-slate-300 print:break-inside-avoid">
          <CardContent className="p-6">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-6">Feedback Volume Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} tickFormatter={(val) => new Date(val).toLocaleDateString("en-US", { weekday: "short" })} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: "#64748b" }} />
                  <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
                  <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }} />
                  <Line type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Positive" />
                  <Line type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} name="Negative" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Distribution */}
        <Card className="print:shadow-none print:border-slate-300 print:break-inside-avoid">
          <CardContent className="p-6">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-4">Sentiment Mix</h3>
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
                    >
                      {sentimentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
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

      <div className="grid gap-6 lg:grid-cols-2 print:grid-cols-2 print:gap-4 print:break-inside-avoid">
        {/* Top Themes */}
        <Card className="print:shadow-none print:border-slate-300">
          <CardContent className="p-6">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" /> Top Discussion Themes
            </h3>
            {data.themes.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No themes detected yet.</p>
            ) : (
              <ul className="space-y-4">
                {data.themes.map((theme) => (
                  <li key={theme.id} className="flex items-center justify-between border-b border-slate-100 pb-2 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-indigo-50 flex items-center justify-center text-xs font-black text-indigo-600">
                        {theme.count}
                      </div>
                      <span className="font-bold text-sm text-slate-800">{theme.name}</span>
                    </div>
                    <Badge variant="green" className="font-bold text-[10px]">+{theme.growth}%</Badge>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Customer Quotes */}
        <Card className="print:shadow-none print:border-slate-300">
          <CardContent className="p-6">
            <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
              <MessageSquareQuote className="h-4 w-4" /> Notable Feedback
            </h3>
            {data.quotes.length === 0 ? (
              <p className="text-xs text-slate-500 font-medium">No notable quotes to display.</p>
            ) : (
              <ul className="space-y-3">
                {data.quotes.map((quote) => (
                  <li key={quote.id} className="bg-slate-50 p-3 rounded-xl border border-slate-100 print:bg-white print:border-slate-200">
                    <p className="text-sm text-slate-700 italic leading-snug">"{quote.content}"</p>
                    <div className="flex justify-between mt-2 items-center">
                      <span className="text-[10px] font-bold text-slate-500">{quote.customerName}</span>
                      <Badge variant={quote.sentimentLabel?.toLowerCase() === "positive" ? "green" : quote.sentimentLabel?.toLowerCase() === "negative" ? "rose" : "slate"} className="text-[9px]">
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
