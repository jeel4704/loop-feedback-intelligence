export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NEXT_BUILD_PHASE === "true" || process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  return NextResponse.json({ error: "Deprecated. Use /api/magic-link/verify" }, { status: 404 });
}
