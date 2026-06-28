export interface ThemeItem {
  id: string;
  workspaceId: string;
  name: string;
  description: string;
  featureArea: string;
}

export interface ThemeSummary extends ThemeItem {
  feedbackCount: number;
  sentimentSummary: string;
}
