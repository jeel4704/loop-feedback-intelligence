import { demoThemes } from "@/data/themes";
import { demoWorkspace } from "@/data/users";
import type { FeedbackItem } from "@/types/feedback";

const channels: FeedbackItem["channel"][] = [
  "Support Ticket",
  "App Store Review",
  "NPS Survey",
  "Sales Call",
  "Community Forum",
  "Live Chat"
];

const sentiments: FeedbackItem["sentiment"][] = [
  "Negative",
  "Positive",
  "Neutral",
  "Negative",
  "Positive",
  "Neutral"
];

const statuses: FeedbackItem["status"][] = ["NEW", "REVIEWED", "ACTIONED"];

const customerLabels = [
  "Acme IT Manager",
  "Operations Lead",
  "CS Manager",
  "RevOps Analyst",
  "Support Admin",
  "Product Champion",
  "Implementation Lead",
  "Growth Manager",
  "Solutions Engineer",
  "Enterprise Buyer",
  "Mobile Power User",
  "Community Moderator"
];

const themeTemplates = {
  Onboarding: [
    "Onboarding took too long before my team could import feedback.",
    "The setup checklist is clear now, but the first import still needs too many clicks.",
    "I would love a faster onboarding flow with a guided workspace setup."
  ],
  Billing: [
    "Billing details were difficult to understand during plan upgrade.",
    "The invoice breakdown looks much better now than it did last month.",
    "We need clearer plan limits before procurement approves expansion."
  ],
  "Mobile App": [
    "The mobile app feels polished, but filters reset too often.",
    "Push notifications on the mobile app helped our team respond faster.",
    "The mobile app crashes when I open a long customer thread."
  ],
  Dashboard: [
    "The new dashboard loads much faster.",
    "Dashboard widgets look great, but I still want more customization.",
    "The dashboard makes weekly review meetings much easier."
  ],
  Notifications: [
    "Notifications are helpful, but there are too many low-priority alerts.",
    "I appreciate the new alert digest for daily feedback summaries.",
    "Notification rules need more control for different teams."
  ],
  Performance: [
    "Search and trend pages feel noticeably faster after the last update.",
    "Performance drops when I open reports with many quotes.",
    "The product feels sluggish during peak afternoon hours."
  ],
  Authentication: [
    "Password reset worked, but the login flow still feels clunky.",
    "SSO setup was easier than expected for our team.",
    "Authentication errors are confusing when a session expires."
  ],
  API: [
    "The API docs are better, but rate limit messages still need examples.",
    "Our developer loved how quickly the API integration started working.",
    "Webhooks should retry more transparently when the endpoint times out."
  ],
  Export: [
    "CSV export is useful, but column names could match the dashboard.",
    "PDF export formatting looks much more polished now.",
    "Exporting filtered feedback should preserve sentiment tags."
  ],
  Integrations: [
    "The Slack integration saved our team a lot of manual triage time.",
    "HubSpot sync failed twice before reconnecting successfully.",
    "Integration setup should explain field mapping more clearly."
  ],
  Reports: [
    "Weekly VOC reports are becoming one of the most useful features.",
    "I want report templates for leadership and product teams.",
    "Reports need easier sharing with external stakeholders."
  ],
  Search: [
    "Search results are accurate, but advanced filters are hard to discover.",
    "I found the right feedback instantly with the new search ranking.",
    "Saved searches would make this much more powerful for analysts."
  ]
} satisfies Record<string, string[]>;

const negativeThemes = new Set(["Onboarding", "Billing", "Authentication"]);
const positiveThemes = new Set(["Dashboard", "Performance", "Reports"]);

function scoreForSentiment(sentiment: FeedbackItem["sentiment"], index: number) {
  if (sentiment === "Positive") {
    return Number((0.61 + (index % 25) * 0.01).toFixed(2));
  }

  if (sentiment === "Neutral") {
    return Number((0.05 + (index % 10) * 0.02).toFixed(2));
  }

  return Number((-0.82 + (index % 18) * 0.02).toFixed(2));
}

function sentimentForTheme(themeName: string, index: number): FeedbackItem["sentiment"] {
  if (negativeThemes.has(themeName)) {
    return index % 5 === 0 ? "Neutral" : "Negative";
  }

  if (positiveThemes.has(themeName)) {
    return index % 4 === 0 ? "Neutral" : "Positive";
  }

  return sentiments[index % sentiments.length];
}

function dateForIndex(index: number): string {
  const baseDate = new Date("2026-06-28T10:00:00.000Z");
  baseDate.setUTCDate(baseDate.getUTCDate() - (index % 30));
  baseDate.setUTCHours(9 + (index % 9), (index * 7) % 60, 0, 0);
  return baseDate.toISOString();
}

export const demoFeedback: FeedbackItem[] = Array.from({ length: 128 }, (_, index) => {
  const theme = demoThemes[index % demoThemes.length];
  const sentiment = sentimentForTheme(theme.name, index);
  const templates = themeTemplates[theme.name];
  const content = templates[index % templates.length];

  return {
    id: `feedback_${String(index + 1).padStart(3, "0")}`,
    workspaceId: demoWorkspace.id,
    content,
    customerLabel: customerLabels[index % customerLabels.length],
    channel: channels[index % channels.length],
    sentiment,
    sentimentScore: scoreForSentiment(sentiment, index),
    theme: theme.name,
    featureArea: theme.featureArea,
    status: statuses[index % statuses.length],
    createdAt: dateForIndex(index)
  };
});

