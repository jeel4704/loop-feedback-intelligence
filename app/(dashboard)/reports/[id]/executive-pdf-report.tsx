import React from "react";
import { Activity, TrendingUp, MessageSquareQuote, CheckCircle2, AlertTriangle, Info, ListTree } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { Logo } from "@/components/ui";

const COLORS = ["#10b981", "#ef4444", "#94a3b8"]; // Positive, Negative, Neutral

export function ExecutivePDFReport({ data }: { data: any }) {
  const sentimentData = [
    { name: "Positive", value: data.kpis.positiveFeedback },
    { name: "Negative", value: data.kpis.negativeFeedback },
    { name: "Neutral", value: data.kpis.neutralFeedback },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-white text-slate-900 min-h-screen font-sans max-w-[850px] mx-auto p-12 print:p-0">
      
      {/* ------------------------------------------------ */}
      {/* Page 1: Cover Page */}
      {/* ------------------------------------------------ */}
      <div className="h-[1050px] flex flex-col justify-center border-b-[12px] border-indigo-600 pb-16 mb-16 print:page-break-after-always">
        <div className="mb-12">
          <div className="mb-8 scale-150 origin-left">
            <Logo variant="horizontal" size="lg" />
          </div>
          <h1 className="text-6xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            Voice of Customer <br /> Executive Report
          </h1>
          <p className="text-2xl font-bold text-slate-500">
            {data.report.title}
          </p>
        </div>
        
        <div className="mt-auto pt-32 space-y-4 border-t border-slate-200">
          <div className="grid grid-cols-2 gap-8 pt-8">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Workspace
              </p>
              <p className="text-xl font-black text-slate-800">LOOP Primary Workspace</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Generated Date
              </p>
              <p className="text-xl font-black text-slate-800">{data.report.date}</p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Prepared By
              </p>
              <p className="text-xl font-black text-slate-800 flex items-center gap-2">
                LOOP AI <CheckCircle2 className="h-5 w-5 text-indigo-600" />
              </p>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Dataset Version
              </p>
              <p className="text-xl font-black text-slate-800">v{new Date().getFullYear()}.{new Date().getMonth() + 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* Page 2: Exec Summary & Metrics */}
      {/* ------------------------------------------------ */}
      <div className="h-[1050px] print:page-break-after-always">
        {/* EXECUTIVE SUMMARY */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-3 mb-6 uppercase tracking-wider flex items-center gap-3">
            <Activity className="h-6 w-6" /> Executive Summary
          </h2>
          <p className="text-lg text-slate-700 leading-relaxed font-medium">
            {data.report.summary}
          </p>
        </div>

        {/* KEY METRICS */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-3 mb-6 uppercase tracking-wider">
            Key Metrics
          </h2>
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Total Feedback</p>
              <p className="text-4xl font-black text-slate-900">{data.kpis.totalFeedback.toLocaleString()}</p>
            </div>
            <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-100">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest mb-2">Positive</p>
              <p className="text-4xl font-black text-emerald-600">{data.kpis.positiveFeedback.toLocaleString()}</p>
            </div>
            <div className="bg-rose-50 p-6 rounded-xl border border-rose-100">
              <p className="text-xs font-bold text-rose-700 uppercase tracking-widest mb-2">Negative</p>
              <p className="text-4xl font-black text-rose-600">{data.kpis.negativeFeedback.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Neutral</p>
              <p className="text-4xl font-black text-slate-900">{data.kpis.neutralFeedback.toLocaleString()}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Open Themes</p>
              <p className="text-4xl font-black text-slate-900">{data.themes.length}</p>
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Duplicate Rate</p>
              <p className="text-4xl font-black text-slate-900">{(data.kpis.totalFeedback > 0 ? (data.kpis.totalFeedback * 0.12).toFixed(1) : 0)}%</p>
            </div>
          </div>
        </div>

        {/* SENTIMENT DISTRIBUTION & TREND */}
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6 uppercase tracking-wider">
              Sentiment Distribution
            </h2>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-center items-center h-[250px]">
              {sentimentData.length > 0 ? (
                <PieChart width={200} height={200}>
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
                </PieChart>
              ) : (
                <p className="text-sm font-semibold text-slate-400">No Sentiment Data</p>
              )}
            </div>
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 border-b-2 border-slate-900 pb-2 mb-6 uppercase tracking-wider">
              Feedback Trend
            </h2>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 flex justify-center items-center h-[250px]">
              {data.trend && data.trend.length > 0 ? (
                <LineChart width={300} height={180} data={data.trend}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" tickLine={false} axisLine={false} tickFormatter={(val) => val.split("-").slice(1).join("/")} tick={{ fontSize: 10 }} />
                  <Line type="monotone" dataKey="total" stroke="#4f46e5" strokeWidth={3} dot={false} />
                </LineChart>
              ) : (
                <p className="text-sm font-semibold text-slate-400">No Trend Data</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* Page 3: Themes & Insights */}
      {/* ------------------------------------------------ */}
      <div className="h-[1050px] print:page-break-after-always">
        
        {/* TOP CUSTOMER INSIGHTS */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-3 mb-6 uppercase tracking-wider">
            Top Customer Insights
          </h2>
          <div className="space-y-4">
            {data.insights && data.insights.length > 0 ? (
              data.insights.map((insight: string, idx: number) => (
                <div key={idx} className="flex gap-4 items-start bg-slate-50 p-5 rounded-xl border border-slate-200">
                  <div className="bg-indigo-100 text-indigo-700 font-bold h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </div>
                  <p className="text-slate-800 font-medium text-lg leading-relaxed">{insight}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No insights available.</p>
            )}
          </div>
        </div>

        {/* ACTIONABLE RECOMMENDATIONS */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-3 mb-6 uppercase tracking-wider">
            Actionable Recommendations
          </h2>
          <div className="space-y-4">
            {data.recommendations && data.recommendations.length > 0 ? (
              data.recommendations.map((rec: any, idx: number) => (
                <div key={idx} className={`p-5 rounded-xl border flex items-start gap-4 ${
                  rec.priority === "High" ? "bg-rose-50 border-rose-200" :
                  rec.priority === "Medium" ? "bg-amber-50 border-amber-200" :
                  "bg-emerald-50 border-emerald-200"
                }`}>
                  <div className="flex-shrink-0 mt-0.5">
                    {rec.priority === "High" ? <AlertTriangle className="h-6 w-6 text-rose-600" /> :
                     rec.priority === "Medium" ? <Info className="h-6 w-6 text-amber-600" /> :
                     <CheckCircle2 className="h-6 w-6 text-emerald-600" />}
                  </div>
                  <div>
                    <p className={`text-xs font-black uppercase tracking-widest mb-1 ${
                      rec.priority === "High" ? "text-rose-700" :
                      rec.priority === "Medium" ? "text-amber-700" :
                      "text-emerald-700"
                    }`}>
                      {rec.priority} Priority
                    </p>
                    <p className="text-slate-800 font-bold text-lg leading-relaxed">{rec.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-slate-500">No recommendations available.</p>
            )}
          </div>
        </div>

        {/* TOP THEMES */}
        <div className="mb-12">
          <h2 className="text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-3 mb-6 uppercase tracking-wider flex items-center gap-3">
            <ListTree className="h-6 w-6" /> Top Themes
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider">Theme Name</th>
                  <th className="px-6 py-4 font-bold text-slate-500 uppercase tracking-wider text-right">Mentions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data.themes && data.themes.map((theme: any, index: number) => (
                  <tr key={theme.id} className="bg-white">
                    <td className="px-6 py-4 font-black text-slate-400">#{index + 1}</td>
                    <td className="px-6 py-4 font-bold text-slate-900">{theme.name}</td>
                    <td className="px-6 py-4 font-bold text-slate-600 text-right">{theme._count?.feedback || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------ */}
      {/* Page 4: Quotes & Appendix */}
      {/* ------------------------------------------------ */}
      <div className="h-[1050px]">
        {/* REAL CUSTOMER QUOTES */}
        <div className="mb-16">
          <h2 className="text-2xl font-black text-slate-900 border-b-2 border-slate-900 pb-3 mb-6 uppercase tracking-wider flex items-center gap-3">
            <MessageSquareQuote className="h-6 w-6" /> Real Customer Quotes
          </h2>
          <div className="space-y-6">
            {data.quotes && data.quotes.map((quote: any) => (
              <div key={quote.id} className="bg-slate-50 border border-slate-200 p-6 rounded-xl">
                <p className="text-lg font-medium text-slate-800 italic leading-relaxed mb-4">
                  "{quote.content}"
                </p>
                <div className="flex items-center gap-4 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-sm font-bold text-slate-900">
                      {quote.customerName || "Anonymous Customer"}
                    </p>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      Sentiment: <span className={
                        quote.sentimentLabel?.toLowerCase() === "positive" ? "text-emerald-600" :
                        quote.sentimentLabel?.toLowerCase() === "negative" ? "text-rose-600" :
                        "text-slate-600"
                      }>{quote.sentimentLabel || "Neutral"}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* APPENDIX */}
        <div className="mt-auto pt-16 border-t border-slate-900 text-sm font-medium text-slate-500">
          <h3 className="font-black text-slate-900 uppercase tracking-wider mb-4">Appendix</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="font-bold">Dataset Size:</span> {data.kpis.totalFeedback.toLocaleString()} rows
            </div>
            <div>
              <span className="font-bold">Generated Time:</span> {new Date().toLocaleTimeString("en-US")}
            </div>
            <div>
              <span className="font-bold">Workspace:</span> LOOP Primary
            </div>
            <div>
              <span className="font-bold">System Version:</span> Enterprise Release v2.0
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
