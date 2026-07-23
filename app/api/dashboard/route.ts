export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

// Dashboard analytics endpoint placeholder.
export async function GET() {
  if (process.env.NEXT_BUILD_PHASE === "true" || process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  return NextResponse.json({
    metrics: {
      totalFeedback: 0,
      averageSentiment: 0,
      activeThemes: 0
    }
  });
}

