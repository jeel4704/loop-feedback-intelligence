export interface FeedbackItem {
  id: string;
  workspaceId: string;
  content: string;
  customerLabel: string;
  channel:
    | "Support Ticket"
    | "App Store Review"
    | "NPS Survey"
    | "Sales Call"
    | "Community Forum"
    | "Live Chat";
  sentiment: "Positive" | "Neutral" | "Negative";
  sentimentScore: number;
  theme: string;
  featureArea: string;
  status: "NEW" | "REVIEWED" | "ACTIONED";
  createdAt: string;
}
