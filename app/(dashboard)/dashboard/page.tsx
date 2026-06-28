import { DashboardCharts } from "@/components/charts";
import { NotificationList } from "@/components/common";
import { StatCard } from "@/components/dashboard";
import { Badge, Card, CardContent, SectionHeader } from "@/components/ui";
import {
  channelDistribution,
  dashboardStats,
  feedbackVolume30Days,
  sentimentBreakdown,
  themeDistribution,
  weeklyTrend
} from "@/data/dashboard";
import { demoWorkspace } from "@/data/users";

export default function DashboardPage() {
  const statCards = [
    {
      label: "Total Feedback",
      value: String(dashboardStats.totalFeedback),
      delta: "128 records in demo workspace",
      tone: "blue" as const
    },
    {
      label: "Negative Feedback",
      value: String(dashboardStats.negativeFeedback),
      delta: "31 items need closer review",
      tone: "rose" as const
    },
    {
      label: "New This Week",
      value: String(dashboardStats.newThisWeek),
      delta: "18 newly ingested this week",
      tone: "indigo" as const
    },
    {
      label: "Active Themes",
      value: String(dashboardStats.activeThemes),
      delta: "12 tracked themes across teams",
      tone: "green" as const
    }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader
        eyebrow="Workspace Overview"
        title="Welcome back to LOOP"
        description="Track feedback volume, sentiment shifts, and the themes shaping the customer experience across your workspace."
        action={<Badge variant="blue">{demoWorkspace.name}</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <DashboardCharts
        volumeData={feedbackVolume30Days}
        sentimentData={sentimentBreakdown}
        themeData={themeDistribution}
        weeklyTrendData={weeklyTrend}
        channelData={channelDistribution}
      />

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-slate-950 dark:text-slate-50">
              Operational Snapshot
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Positive feedback currently leads the mix with 67 items, but
              onboarding and billing still account for the majority of recent
              negative sentiment. Six Voice of Customer reports are open and
              ready for review.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Positive
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                  {dashboardStats.positiveFeedback}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-900">
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Neutral
                </p>
                <p className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">
                  {dashboardStats.neutralFeedback}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <NotificationList />
      </div>
    </div>
  );
}
