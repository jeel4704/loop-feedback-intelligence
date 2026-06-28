import { demoWorkspace } from "@/data/users";
import type { ReportItem } from "@/types/report";

export const demoReports: ReportItem[] = [
  {
    id: "report_01",
    workspaceId: demoWorkspace.id,
    title: "Weekly Voice of Customer",
    dateRange: "Jun 22 - Jun 28, 2026",
    generatedAt: "2026-06-28T08:30:00.000Z",
    topThemes: ["Onboarding", "Billing", "Dashboard"],
    sentimentSummary:
      "Positive sentiment stayed strong on dashboard usability, while onboarding and billing continued to produce the highest negative share.",
    customerQuotes: [
      "Onboarding took too long before my team could import feedback.",
      "The new dashboard loads much faster."
    ],
    recommendedActions: [
      "Simplify the first-time onboarding checklist.",
      "Rewrite pricing and invoice copy in upgrade flows."
    ],
    status: "READY"
  },
  {
    id: "report_02",
    workspaceId: demoWorkspace.id,
    title: "Executive Product Pulse",
    dateRange: "Jun 15 - Jun 21, 2026",
    generatedAt: "2026-06-22T09:00:00.000Z",
    topThemes: ["Performance", "Reports", "Billing"],
    sentimentSummary:
      "Performance and reports improved noticeably, but billing clarity remains a recurring blocker for expansions.",
    customerQuotes: [
      "Search and trend pages feel noticeably faster after the last update.",
      "We need clearer plan limits before procurement approves expansion."
    ],
    recommendedActions: [
      "Keep monitoring performance after peak traffic windows.",
      "Add pricing FAQ content near plan selection."
    ],
    status: "READY"
  },
  {
    id: "report_03",
    workspaceId: demoWorkspace.id,
    title: "Monthly Billing Watch",
    dateRange: "Jun 1 - Jun 28, 2026",
    generatedAt: "2026-06-28T07:10:00.000Z",
    topThemes: ["Billing", "Integrations", "API"],
    sentimentSummary:
      "Billing complaints are concentrated around upgrades and invoice interpretation, while integration reliability concerns appear in enterprise segments.",
    customerQuotes: [
      "Billing details were difficult to understand during plan upgrade.",
      "HubSpot sync failed twice before reconnecting successfully."
    ],
    recommendedActions: [
      "Clarify plan comparisons and invoice line items.",
      "Add monitoring for reconnect failures in CRM integrations."
    ],
    status: "READY"
  },
  {
    id: "report_04",
    workspaceId: demoWorkspace.id,
    title: "Onboarding Experience Review",
    dateRange: "Jun 8 - Jun 28, 2026",
    generatedAt: "2026-06-27T12:00:00.000Z",
    topThemes: ["Onboarding", "Authentication", "Search"],
    sentimentSummary:
      "Onboarding friction is the clearest source of negative sentiment, amplified by authentication confusion during first login.",
    customerQuotes: [
      "Password reset worked, but the login flow still feels clunky.",
      "I would love a faster onboarding flow with a guided workspace setup."
    ],
    recommendedActions: [
      "Reduce the number of steps before first value.",
      "Improve login recovery messaging for new users."
    ],
    status: "DRAFT"
  },
  {
    id: "report_05",
    workspaceId: demoWorkspace.id,
    title: "Mobile and Notification Trends",
    dateRange: "Jun 10 - Jun 28, 2026",
    generatedAt: "2026-06-26T14:15:00.000Z",
    topThemes: ["Mobile App", "Notifications", "Performance"],
    sentimentSummary:
      "Mobile stability issues remain intermittent, while notification quality is improving but still perceived as noisy by power users.",
    customerQuotes: [
      "The mobile app crashes when I open a long customer thread.",
      "Notifications are helpful, but there are too many low-priority alerts."
    ],
    recommendedActions: [
      "Prioritize crash fixes on long-thread rendering.",
      "Add notification priority presets for admins."
    ],
    status: "READY"
  },
  {
    id: "report_06",
    workspaceId: demoWorkspace.id,
    title: "Reporting Workflow Summary",
    dateRange: "Jun 5 - Jun 25, 2026",
    generatedAt: "2026-06-25T11:45:00.000Z",
    topThemes: ["Reports", "Export", "Dashboard"],
    sentimentSummary:
      "Reporting is trending positively, especially where export quality and dashboard speed improved together.",
    customerQuotes: [
      "Weekly VOC reports are becoming one of the most useful features.",
      "PDF export formatting looks much more polished now."
    ],
    recommendedActions: [
      "Ship leadership-ready report templates.",
      "Preserve dashboard filters inside report exports."
    ],
    status: "READY"
  }
];

