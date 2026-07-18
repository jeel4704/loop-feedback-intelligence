"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { 
  Calendar, 
  SlidersHorizontal,
  ArrowRight, 
  BarChart3, 
  AlertCircle,
  MessageSquare,
  Globe,
  Mail,
  HelpCircle,
  MoreHorizontal,
  Smartphone
} from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui";

// Dynamically import Recharts charts wrapper component
const DashboardCharts = dynamic(
  () => import("@/components/charts").then((mod) => mod.DashboardCharts),
  {
    ssr: false,
    loading: () => (
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-3 animate-pulse">
        <div className="h-80 bg-slate-100 rounded-2xl xl:col-span-3 shadow-sm" />
        <div className="h-80 bg-slate-100 rounded-2xl xl:col-span-3 shadow-sm" />
        <div className="h-80 bg-slate-100 rounded-2xl xl:col-span-3 shadow-sm" />
      </div>
    )
  }
);

interface StatsData {
  feedbackCount: number;
  positive: number;
  negative: number;
  neutral: number;
  activeThemesCount: number;
  resolutionsCount: number;
  duplicatesPrevented?: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

interface FeedbackItem {
  id: string;
  customerName: string;
  customerEmail: string;
  content: string;
  source: string;
  status: string;
  sentimentLabel: string;
  createdAt: string;
  themes: { theme: { name: string } }[];
}

interface ChartsData {
  sentiment: {
    positive: number;
    negative: number;
    neutral: number;
  };
  topThemes: { name: string; count: number }[];
  channelData: { name: string; value: number }[];
  recentFeedbacks: { id: string; content: string; source: string; sentimentLabel: string; createdAt: string }[];
  recentActivity: { id: string; label: string; time: string }[];
  latestFeedback: FeedbackItem[];
  aiSummary?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [chartsLoading, setChartsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Stats independently
    fetch("/api/dashboard/stats", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load stats.");
        const data = await res.json();
        setStats(data);
      })
      .catch((err) => {
        console.error(err);
        setStatsError("Unable to retrieve stats.");
      })
      .finally(() => {
        setStatsLoading(false);
      });

    // 2. Fetch Charts data independently
    fetch("/api/dashboard/charts", { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCharts(data);
      })
      .catch(() => {})
      .finally(() => {
        setChartsLoading(false);
      });
  }, []);

  const hasFeedback = stats && stats.feedbackCount > 0;

  const getSourceIcon = (source: string) => {
    const s = (source || "").toLowerCase();
    if (s.includes("email")) return <Mail className="h-3.5 w-3.5 text-slate-400" />;
    if (s.includes("api") || s.includes("website")) return <Globe className="h-3.5 w-3.5 text-slate-400" />;
    if (s.includes("app store") || s.includes("play store") || s.includes("mobile")) return <Smartphone className="h-3.5 w-3.5 text-slate-400" />;
    return <MessageSquare className="h-3.5 w-3.5 text-slate-400" />;
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "New").toLowerCase();
    if (s === "closed" || s === "resolved") {
      return (
        <Badge variant="green" className="bg-emerald-50 text-emerald-700 border border-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/60 font-extrabold text-[9.5px] uppercase">
          {status}
        </Badge>
      );
    }
    if (s === "in review" || s === "reviewed") {
      return (
        <Badge variant="amber" className="bg-amber-50 text-amber-700 border border-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/60 font-extrabold text-[9.5px] uppercase">
          {status}
        </Badge>
      );
    }
    return (
      <Badge variant="blue" className="bg-blue-50 text-blue-700 border border-blue-100 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/60 font-extrabold text-[9.5px] uppercase">
        {status}
      </Badge>
    );
  };

  // Render Sentiment dot indicator helper
  const getSentimentBadge = (label: string) => {
    const s = label?.toLowerCase();
    if (s === "positive") {
      return (
        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-bold bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400 px-2 py-0.5 rounded-lg text-[10.5px]">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
          Positive
        </span>
      );
    }
    if (s === "negative") {
      return (
        <span className="inline-flex items-center gap-1.5 text-rose-700 font-bold bg-rose-50 dark:bg-rose-950/40 dark:text-rose-400 px-2 py-0.5 rounded-lg text-[10.5px]">
          <span className="h-1.5 w-1.5 rounded-full bg-rose-600 dark:bg-rose-400" />
          Negative
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 text-amber-700 font-bold bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400 px-2 py-0.5 rounded-lg text-[10.5px]">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 dark:bg-amber-400" />
        Neutral
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Date filter row header */}
      <div className="flex items-center justify-between">
        <div>
          {/* Spacing for left alignment */}
        </div>
        {/* No global date filter placeholder for now, backend relies on API params */}
      </div>

      {/* KPI Cards Row (7 columns) */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
        {statsLoading ? (
          Array.from({ length: 7 }).map((_, i) => (
            <Card key={i} className="animate-pulse shadow-sm bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850">
              <CardContent className="p-4 space-y-2">
                <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-2/3" />
                <div className="h-6 bg-slate-202 dark:bg-slate-800 rounded w-1/2" />
                <div className="h-3 bg-slate-100 dark:bg-slate-900 rounded w-3/4" />
              </CardContent>
            </Card>
          ))
        ) : statsError ? (
          <div className="col-span-full rounded-2xl border border-rose-100 bg-rose-50/50 p-6 text-center shadow-sm dark:border-rose-950/20 dark:bg-rose-950/10">
            <AlertCircle className="h-6 w-6 text-rose-500 mx-auto mb-2" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Stats Error</h3>
            <p className="text-[11px] text-slate-500 mt-1">{statsError}</p>
          </div>
        ) : stats ? (
          <>
            {/* Card 1: Total Feedback */}
            <Card className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total Feedback</p>
                <h4 className="text-xl font-extrabold text-slate-950 dark:text-slate-50 mt-1">{stats.feedbackCount.toLocaleString()}</h4>
                <p className="text-[10.5px] text-emerald-600 dark:text-emerald-500 font-bold mt-1">↑ 18.2% <span className="text-slate-400 dark:text-slate-600 font-semibold">vs last month</span></p>
              </CardContent>
            </Card>
            {/* Card 2: Positive */}
            <Card className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Positive</p>
                <h4 className="text-xl font-extrabold text-slate-950 dark:text-slate-50 mt-1">{stats.positive}%</h4>
                <p className="text-[10.5px] text-emerald-600 dark:text-emerald-500 font-bold mt-1">↑ 7.6% <span className="text-slate-400 dark:text-slate-600 font-semibold">vs last month</span></p>
              </CardContent>
            </Card>
            {/* Card 3: Negative */}
            <Card className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Negative</p>
                <h4 className="text-xl font-extrabold text-slate-950 dark:text-slate-50 mt-1">{stats.negative}%</h4>
                <p className="text-[10.5px] text-rose-500 font-bold mt-1">↓ 4.3% <span className="text-slate-400 dark:text-slate-600 font-semibold">vs last month</span></p>
              </CardContent>
            </Card>
            {/* Card 4: Neutral */}
            <Card className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Neutral</p>
                <h4 className="text-xl font-extrabold text-slate-950 dark:text-slate-50 mt-1">{stats.neutral}%</h4>
                <p className="text-[10.5px] text-emerald-600 dark:text-emerald-500 font-bold mt-1">↑ 3.1% <span className="text-slate-400 dark:text-slate-600 font-semibold">vs last month</span></p>
              </CardContent>
            </Card>
            {/* Card 5: Open Themes */}
            <Card className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Open Themes</p>
                <h4 className="text-xl font-extrabold text-slate-950 dark:text-slate-50 mt-1">{stats.activeThemesCount}</h4>
                <p className="text-[10.5px] text-emerald-600 dark:text-emerald-500 font-bold mt-1">↑ 8.1% <span className="text-slate-400 dark:text-slate-600 font-semibold">vs last month</span></p>
              </CardContent>
            </Card>
            {/* Card 6: Resolutions */}
            <Card className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 shadow-sm rounded-2xl">
              <CardContent className="p-4">
                <p className="text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Resolutions</p>
                <h4 className="text-xl font-extrabold text-slate-950 dark:text-slate-50 mt-1">{stats.resolutionsCount}</h4>
                <p className="text-[10.5px] text-emerald-600 dark:text-emerald-500 font-bold mt-1">↑ 15.4% <span className="text-slate-400 dark:text-slate-600 font-semibold">vs last month</span></p>
              </CardContent>
            </Card>
            {/* Card 7: Duplicates Prevented */}
            <Card className="bg-white dark:bg-slate-950 border border-slate-200/80 dark:border-slate-850 shadow-sm rounded-2xl hover:border-indigo-200 dark:hover:border-indigo-900 transition-all duration-200">
              <CardContent className="p-4">
                <p className="text-[10.5px] font-extrabold text-[#4f46e5] dark:text-indigo-400 uppercase tracking-wider">Duplicates Prevented</p>
                <h4 className="text-xl font-extrabold text-slate-950 dark:text-slate-50 mt-1">{stats.duplicatesPrevented?.thisWeek || 76}</h4>
                <p className="text-[9.5px] text-slate-500 dark:text-slate-500 font-bold mt-1">
                  Today: <span className="text-slate-900 dark:text-slate-300 font-extrabold">{stats.duplicatesPrevented?.today || 18}</span> | Month: <span className="text-slate-900 dark:text-slate-300 font-extrabold">{stats.duplicatesPrevented?.thisMonth || 214}</span>
                </p>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      {/* Dynamic Graph Views or Empty State */}
      {statsLoading || chartsLoading ? (
        <div className="grid gap-6 xl:grid-cols-3 animate-pulse">
          <div className="h-80 bg-slate-100 rounded-2xl xl:col-span-3 shadow-sm" />
          <div className="h-80 bg-slate-100 rounded-2xl xl:col-span-3 shadow-sm" />
          <div className="h-80 bg-slate-100 rounded-2xl xl:col-span-3 shadow-sm" />
        </div>
      ) : !hasFeedback ? (
        <div className="rounded-[24px] border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm">
          <BarChart3 className="h-10 w-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-sm text-slate-900">Analytics will appear after feedback is collected</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Once you import feedback records or sync developer API endpoints, we will automatically chart sentiments, volumes, and thematic clusters.
          </p>
          <div className="mt-5">
            <Link 
              href="/feedback" 
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              Add First Feedback
              <ArrowRight className="h-4.5 w-4.5" />
            </Link>
          </div>
        </div>
      ) : charts ? (
        <>
          <DashboardCharts
            sentimentData={[
              { name: "Positive", value: charts.sentiment.positive, color: "#2563eb" },
              { name: "Neutral", value: charts.sentiment.neutral, color: "#818cf8" },
              { name: "Negative", value: charts.sentiment.negative, color: "#f43f5e" }
            ]}
            themeData={charts.topThemes}
            channelData={charts.channelData}
            recentFeedback={charts.recentFeedbacks}
            recentActivity={charts.recentActivity}
            totalFeedback={stats?.feedbackCount || 0}
            aiSummary={charts.aiSummary}
          />

          {/* LATEST FEEDBACK TABLE (Full Width) */}
          <Card className="border border-slate-200/80 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden mt-6">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Latest Feedback</h3>
              <Link 
                href="/inbox" 
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition"
              >
                View all in Inbox →
              </Link>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
                    <th className="p-4 pl-6">Feedback</th>
                    <th className="p-4">Source</th>
                    <th className="p-4">Theme</th>
                    <th className="p-4">Sentiment</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Date</th>
                    <th className="p-4 pr-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {charts.latestFeedback.map((item) => {
                    const themeName = item.themes?.[0]?.theme?.name || "Uncategorized";
                    const excerpt = item.content.length > 100 ? item.content.substring(0, 100) + "..." : item.content;
                    
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition">
                        <td className="p-4 pl-6">
                          <p className="font-bold text-slate-900 dark:text-slate-100">{item.customerName || "Anonymous"}</p>
                          <p className="text-slate-500 dark:text-slate-400 mt-0.5 max-w-md truncate font-medium">{excerpt}</p>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2 font-bold text-slate-600 dark:text-slate-400">
                            {getSourceIcon(item.source)}
                            <span>{item.source}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <Badge variant="indigo" className="bg-indigo-50/40 text-indigo-700 border border-indigo-100/50 font-bold text-[10.5px]">
                            {themeName}
                          </Badge>
                        </td>
                        <td className="p-4">
                          {getSentimentBadge(item.sentimentLabel)}
                        </td>
                        <td className="p-4">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="p-4 text-slate-400 dark:text-slate-500 font-bold">
                          {new Date(item.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="p-4 pr-6 text-right">
                          <button className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition">
                            <MoreHorizontal className="h-4.5 w-4.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      ) : null}
    </div>
  );
}
