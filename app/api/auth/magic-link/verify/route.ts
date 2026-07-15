import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ error: "Deprecated. Use /api/magic-link/verify" }, { status: 404 });
}
