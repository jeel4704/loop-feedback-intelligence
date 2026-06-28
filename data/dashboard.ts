import { demoFeedback } from "@/data/feedback";
import { demoThemes } from "@/data/themes";

const feedbackSorted = [...demoFeedback].sort(
  (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
);

export const dashboardStats = {
  totalFeedback: 128,
  negativeFeedback: 31,
  positiveFeedback: 67,
  neutralFeedback: 30,
  newThisWeek: 18,
  activeThemes: 12,
  openReports: 6
} as const;

export const sentimentBreakdown = [
  { name: "Positive", value: dashboardStats.positiveFeedback, color: "#2563eb" },
  { name: "Neutral", value: dashboardStats.neutralFeedback, color: "#818cf8" },
  { name: "Negative", value: dashboardStats.negativeFeedback, color: "#f43f5e" }
] as const;

export const feedbackVolume30Days = Array.from({ length: 30 }, (_, index) => {
  const date = new Date("2026-05-30T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + index);
  const label = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC"
  });
  const count = feedbackSorted.filter((item) => {
    const current = new Date(item.createdAt);
    return (
      current.getUTCDate() === date.getUTCDate() &&
      current.getUTCMonth() === date.getUTCMonth()
    );
  }).length;

  return {
    name: label,
    value: count
  };
});

export const weeklyTrend = [
  { name: "Week 1", total: 26, negative: 9, positive: 11 },
  { name: "Week 2", total: 31, negative: 7, positive: 16 },
  { name: "Week 3", total: 34, negative: 8, positive: 18 },
  { name: "Week 4", total: 37, negative: 7, positive: 22 }
] as const;

export const themeDistribution = demoThemes.map((theme, index) => ({
  name: theme.name,
  count:
    demoFeedback.filter((item) => item.theme === theme.name).length +
    (index < 4 ? 2 : 0)
}));

export const channelDistribution = [
  "Support Ticket",
  "App Store Review",
  "NPS Survey",
  "Sales Call",
  "Community Forum",
  "Live Chat"
].map((channel) => ({
  name: channel,
  value: demoFeedback.filter((item) => item.channel === channel).length
}));

