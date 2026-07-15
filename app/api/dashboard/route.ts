export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

// Dashboard analytics endpoint placeholder.
export async function GET() {
  return NextResponse.json({
    metrics: {
      totalFeedback: 0,
      averageSentiment: 0,
      activeThemes: 0
    }
  });
}

