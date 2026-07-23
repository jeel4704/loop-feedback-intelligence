export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";

// Simple health endpoint for uptime checks and deployments.
export async function GET() {
  if (process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  return NextResponse.json({ status: "ok", service: "loop-ai-platform" });
}

