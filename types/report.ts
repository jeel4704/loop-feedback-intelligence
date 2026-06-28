export interface ReportItem {
  id: string;
  workspaceId: string;
  title: string;
  dateRange: string;
  generatedAt: string;
  topThemes: string[];
  sentimentSummary: string;
  customerQuotes: string[];
  recommendedActions: string[];
  status: "DRAFT" | "READY" | "ARCHIVED";
}
