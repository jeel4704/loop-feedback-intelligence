export interface ReportItem {
  id: string;
  workspaceId: string;
  title: string;
  summary: string;
  status: "DRAFT" | "READY" | "ARCHIVED";
  createdAt: string;
}

