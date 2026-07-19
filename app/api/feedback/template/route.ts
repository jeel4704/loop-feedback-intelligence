export const dynamic = " force-dynamic;
import { NextResponse } from "next/server";

export async function GET() {
  const headers = ["Name", "Feedback", "Date", "Status", "Channel", "Theme", "Sentiment"];
  const exampleRows = [
    ["John Smith", "Dashboard loads slowly", "15/07/2026", "Open", "Website", "Performance", "Negative"],
    ["Alice Brown", "Customer support was excellent", "15/07/2026", "Closed", "Email", "Support", "Positive"],
    ["David Wilson", "Import process is confusing", "14/07/2026", "Open", "Survey", "Onboarding", "Neutral"]
  ];

  const csvContent = [
    headers.join(","),
    ...exampleRows.map(row => row.map(v => `"${v.replace(/"/g, '""')}"`).join(","))
  ].join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="LOOP_Feedback_Import_Template.csv"'
    }
  });
}
