export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";

export async function GET(req: any) {
  try {
    const { handlers } = await import("@/auth");
    return await handlers.GET(req);
  } catch (err: any) {
    return NextResponse.json({ error: "NextAuth GET/Module Error", message: err?.message, stack: err?.stack }, { status: 500 });
  }
}

export async function POST(req: any) {
  try {
    const { handlers } = await import("@/auth");
    return await handlers.POST(req);
  } catch (err: any) {
    return NextResponse.json({ error: "NextAuth POST/Module Error", message: err?.message, stack: err?.stack }, { status: 500 });
  }
}
