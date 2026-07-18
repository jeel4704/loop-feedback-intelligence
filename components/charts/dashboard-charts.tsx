"use client";

import { useState, useEffect } from "react";
import {
  Bar,
  BarChart,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import Link from "next/link";
import { Sparkles, ArrowRight, MessageSquare, Clock } from "lucide-react";
import { Badge, Card, CardContent } from "@/components/ui";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";

interface VolumeDatum {
  name: string;
  value: number;
  negativeValue?: number;
}

interface SentimentDatum {
  name: string;
  value: number;
  color: string;
}

interface ThemeDatum {
  name: string;
  count: number;
}

interface ChannelDatum {
  name: string;
  value: number;
}

interface RecentFeedbackItem {
  id: string;
  content: string;
  source: string;
  sentimentLabel: string;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  label: string;
  time: string;
}

interface DashboardChartsProps {
  sentimentData: SentimentDatum[];
  themeData: ThemeDatum[];
  channelData?: ChannelDatum[];
  recentFeedback?: RecentFeedbackItem[];
  recentActivity?: ActivityItem[];
  totalFeedback?: number;
  aiSummary?: string;
}

export function DashboardCharts({
  sentimentData,
  themeData,
  channelData = [],
  recentFeedback = [],
  recentActivity = [],
  totalFeedback = 0,
  aiSummary
}: DashboardChartsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Trend State Management
  const [period, setPeriod] = useState<"daily" | "weekly" | "monthly" | "yearly">("daily");
  const [volumeData, setVolumeData] = useState<VolumeDatum[]>([]);
  const [trendLoading, setTrendLoading] = useState(true);
  const [trendError, setTrendError] = useState("");

  const fetchTrendData = () => {
    setTrendLoading(true);
    setTrendError("");
    fetch(`/api/analytics/trends?period=${period}`, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) throw new Error("Failed to load trend analytics.");
        const data = await res.json();
        setVolumeData(data);
      })
      .catch((err) => {
        console.error(err);
        setTrendError("Unable to load feedback analytics.");
      })
      .finally(() => {
        setTrendLoading(false);
      });
  };

  useEffect(() => {
    fetchTrendData();
  }, [period]);

  const sentimentTotal = sentimentData.reduce((acc, curr) => acc + curr.value, 0);
  const channelColors = ["#4f46e5", "#06b6d4", "#3b82f6", "#eab308", "#f43f5e"];
  const displayTotal = totalFeedback > 0 ? totalFeedback : sentimentTotal;

  const showAdditionalLists = channelData.length > 0 && recentFeedback.length > 0;

  // Track hovered segment details
  const [activeSentiment, setActiveSentiment] = useState<{ name: string; value: number } | null>(null);
  const [activeChannel, setActiveChannel] = useState<{ name: string; value: number } | null>(null);

  const sentimentPercentage = activeSentiment && sentimentTotal > 0 ? Math.round((activeSentiment.value / sentimentTotal) * 100) : 0;
  const channelTotal = channelData.reduce((acc, curr) => acc + curr.value, 0);
  const channelPercentage = activeChannel && channelTotal > 0 ? Math.round((activeChannel.value / channelTotal) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* ROW 1: FEEDBACK TREND (Line), SENTIMENT (Donut), AI SUMMARY (Card) */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-12">
        {/* Feedback Trend (Line Chart) */}
        <Card className="lg:col-span-8 border border-slate-200/80 dark:border-slate-900 shadow-sm bg-white dark:bg-slate-950 rounded-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">Feedback Trend</h3>
                <div className="mt-1 flex items-center gap-4 text-xs font-semibold">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#4f46e5]" />
                    <span className="text-slate-500 dark:text-slate-400">Total Feedback</span>
                  </div>
                  {volumeData.some(d => d.negativeValue !== undefined && d.negativeValue > 0) && (
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#f43f5e]" />
                      <span className="text-slate-500 dark:text-slate-400">Negative Feedback</span>
                    </div>
                  )}
                </div>
              </div>
              <select 
                value={period}
                onChange={(e) => setPeriod(e.target.value as "daily" | "weekly" | "monthly" | "yearly")}
                className="border border-slate-200 dark:border-slate-800 rounded-lg text-[10.5px] font-bold px-2.5 py-1 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-350 outline-none cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
            <div className="h-60 relative">
              {trendLoading ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 z-10 bg-white/60 dark:bg-slate-950/60 backdrop-blur-[1px] animate-pulse">
                  <div className="h-4 w-4 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading feedback analytics...</p>
                </div>
              ) : trendError ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-rose-50/40 dark:bg-rose-950/10 rounded-xl border border-dashed border-rose-200 dark:border-rose-900/50">
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400 mb-2">{trendError}</p>
                  <button 
                    onClick={fetchTrendData}
                    className="text-[10px] uppercase tracking-wider font-extrabold px-3 py-1.5 bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 rounded hover:bg-rose-200 dark:hover:bg-rose-900/50 transition"
                  >
                    Retry
                  </button>
                </div>
              ) : null}
              
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={volumeData}>
                  <XAxis dataKey="name" stroke={isDark ? "#475569" : "#94a3b8"} fontSize={9.5} tickLine={false} axisLine={false} />
                  <YAxis stroke={isDark ? "#475569" : "#94a3b8"} fontSize={9.5} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                      borderColor: isDark ? "#1e293b" : "#e2e8f0",
                      color: isDark ? "#f8fafc" : "#0f172a",
                      borderRadius: "12px",
                      fontSize: "11px",
                      fontWeight: "bold",
                      boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#4f46e5" 
                    strokeWidth={2.5} 
                    dot={false}
                    isAnimationActive={true}
                    animationDuration={600}
                  />
                  {volumeData.some(d => d.negativeValue !== undefined && d.negativeValue > 0) && (
                    <Line 
                      type="monotone" 
                      dataKey="negativeValue" 
                      stroke="#f43f5e" 
                      strokeWidth={2} 
                      strokeDasharray="4 4" 
                      dot={false}
                      isAnimationActive={true}
                      animationDuration={600}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sentiment Distribution (Donut Chart) */}
        <Card className="lg:col-span-4 border border-slate-200/80 dark:border-slate-900 shadow-sm bg-white dark:bg-slate-950 rounded-2xl">
          <CardContent className="p-6 flex flex-col justify-between h-full">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4">Sentiment Distribution</h3>
              <div className="h-44 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sentimentData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={4}
                      onMouseEnter={(data) => {
                        if (data && data.name) {
                          setActiveSentiment({ name: data.name, value: data.value });
                        }
                      }}
                      onMouseLeave={() => {
                        setActiveSentiment(null);
                      }}
                    >
                      {sentimentData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} style={{ cursor: "pointer", outline: "none" }} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                {/* Donut Center text displaying active segment details or total */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  {activeSentiment ? (
                    <>
                      <span className="text-[11px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider">
                        {activeSentiment.name}
                      </span>
                      <span className="text-lg font-extrabold text-slate-900 dark:text-slate-100 leading-none mt-1">
                        {sentimentPercentage}%
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-lg font-extrabold text-slate-950 dark:text-slate-50 leading-none">
                        {displayTotal.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold tracking-wider mt-0.5">
                        TOTAL
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Percentages Legend */}
            <div className="grid grid-cols-3 gap-1 mt-4 text-center">
              {sentimentData.map((item) => {
                const percentage = sentimentTotal > 0 ? Math.round((item.value / sentimentTotal) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-0.5">
                    <div className="flex items-center justify-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-[10.5px] text-slate-400 font-bold">{item.name}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-950 dark:text-slate-200">{percentage}%</p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Summary Widget (Full Width) */}
      <Card className="border border-slate-200/80 dark:border-slate-900 shadow-sm bg-white dark:bg-slate-950 rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5">
              <Sparkles className="h-4.5 w-4.5 text-[#4f46e5] dark:text-indigo-400" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">AI Summary</h3>
            </div>
            <Link href="/reports" className="text-[10px] text-[#4f46e5] dark:text-indigo-400 font-extrabold hover:underline">
              View Full Report
            </Link>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-350 leading-relaxed font-semibold">
            {aiSummary || "Customer sentiment is improving this month with positive feedback. The most discussed themes are App Performance and Feature Requests."}
          </p>
          <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-850 space-y-3">
            <p className="text-[10.5px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Top Insights</p>
            <ul className="grid gap-4 grid-cols-1 md:grid-cols-3">
              <li className="flex items-start gap-2.5 text-xs bg-slate-50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/80">
                <span className="text-emerald-500 font-extrabold text-sm">↑</span>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Performance</p>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">App Performance issues decreased by 15%</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs bg-slate-50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/80">
                <span className="text-blue-500 font-extrabold text-sm">↑</span>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Themes</p>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">Feature Requests increased by 23%</p>
                </div>
              </li>
              <li className="flex items-start gap-2.5 text-xs bg-slate-50 dark:bg-slate-900/30 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/80">
                <span className="text-rose-500 font-extrabold text-sm">↓</span>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">Pricing</p>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold mt-0.5">Pricing concerns decreased by 12%</p>
                </div>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* ROW 2: TOP THEMES (Bar) & CHANNEL (Donut) */}
      <div className={cn(
        "grid gap-6 grid-cols-1 items-start",
        showAdditionalLists ? "lg:grid-cols-12" : "lg:grid-cols-3"
      )}>
        {/* Top Themes list */}
        <Card className={cn(
          "border border-slate-200/80 dark:border-slate-900 shadow-sm bg-white dark:bg-slate-950 rounded-2xl",
          showAdditionalLists ? "lg:col-span-7" : "lg:col-span-3"
        )}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50">Top Themes</h3>
              <Link href="/themes" className="text-[10px] text-slate-400 dark:text-slate-500 font-bold hover:text-slate-600 dark:hover:text-slate-300">View all</Link>
            </div>
            <div className={cn("space-y-3.5", showAdditionalLists ? "" : "grid gap-6 md:grid-cols-2 lg:grid-cols-5 space-y-0")}>
              {themeData.length === 0 ? (
                <p className="text-xs text-slate-400">No active themes yet.</p>
              ) : (
                themeData.map((theme) => {
                  const pct = displayTotal > 0 ? Math.round((theme.count / displayTotal) * 100) : 10;
                  return (
                    <div key={theme.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300 truncate max-w-[120px]">{theme.name}</span>
                        <span className="text-slate-400 dark:text-slate-500 text-[11px]">{pct}%</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full" 
                          style={{ width: `${pct}%` }} 
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        {showAdditionalLists && (
          /* Feedback by Channel Donut */
          <Card className="lg:col-span-5 border border-slate-200/80 dark:border-slate-900 shadow-sm bg-white dark:bg-slate-950 rounded-2xl">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-50 mb-4">Feedback by Channel</h3>
                <div className="h-32 relative flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={channelData}
                        dataKey="value"
                        cx="50%"
                        cy="50%"
                        innerRadius={38}
                        outerRadius={52}
                        paddingAngle={3}
                        onMouseEnter={(data) => {
                          if (data && data.name) {
                            setActiveChannel({ name: data.name, value: data.value });
                          }
                        }}
                        onMouseLeave={() => {
                          setActiveChannel(null);
                        }}
                      >
                        {channelData.map((entry, idx) => (
                          <Cell key={entry.name} fill={channelColors[idx % channelColors.length]} style={{ cursor: "pointer", outline: "none" }} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Donut Center text displaying active channel or total */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    {activeChannel ? (
                      <>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-extrabold uppercase tracking-wider max-w-[65px] truncate">
                          {activeChannel.name}
                        </span>
                        <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100 leading-none mt-0.5">
                          {channelPercentage}%
                        </span>
                      </>
                    ) : (
                      <span className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                        {displayTotal}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-3 space-y-1 text-[11px]">
                {channelData.map((item, idx) => (
                  <div key={item.name} className="flex items-center justify-between font-semibold">
                    <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: channelColors[idx % channelColors.length] }} />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-slate-800 dark:text-slate-200 font-bold">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {showAdditionalLists && (
        /* ROW 3: RECENT FEEDBACK (List) & ACTIVITY (List) */
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-12 items-start">
          {/* Recent Feedback items */}
          <Card className="lg:col-span-6 border border-slate-200/80 dark:border-slate-900 shadow-sm bg-white dark:bg-slate-950 rounded-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-950 dark:text-slate-50">Recent Feedback</h3>
                <Link href="/inbox" className="text-[10px] text-slate-400 dark:text-slate-550 font-bold hover:text-slate-600 dark:hover:text-slate-350">View all</Link>
              </div>
              <div className="space-y-4">
                {recentFeedback.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <p className="text-[11.5px] text-slate-700 dark:text-slate-300 leading-normal line-clamp-2 font-medium">
                      "{item.content}"
                    </p>
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      <span className="bg-slate-105 dark:bg-slate-900 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded uppercase tracking-wider text-[8px] border border-slate-200/20 dark:border-slate-800">
                        {item.source}
                      </span>
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity feed */}
          <Card className="lg:col-span-6 border border-slate-200/80 dark:border-slate-900 shadow-sm bg-white dark:bg-slate-950 rounded-2xl">
            <CardContent className="p-6 flex flex-col justify-between h-full">
              <div>
                <h3 className="text-sm font-bold text-slate-955 dark:text-slate-50 mb-4">Recent Activity</h3>
                <div className="space-y-3.5">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-2.5 text-xs">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                      <div>
                        <p className="text-slate-700 dark:text-slate-300 font-semibold leading-normal">{activity.label}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-550 font-bold mt-0.5 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button className="w-full text-center text-[10.5px] font-extrabold text-[#4f46e5] dark:text-indigo-400 hover:underline flex items-center justify-center gap-1 mt-4">
                View all activity
                <ArrowRight className="h-3 w-3" />
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
