import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Claude AI classification endpoint placeholder.
export async function POST() {
  return NextResponse.json({
    label: "unclassified",
    confidence: 0,
    themes: []
  });
}

