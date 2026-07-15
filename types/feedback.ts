export interface FeedbackItem {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  sentiment?: number | null;
  source: "CSV" | "MANUAL" | "API";
  createdAt: string;
}

