export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  if (process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let workspaceId = (session.user as any).workspaceId;
    const membership = await prisma.workspaceMembership.findFirst({
      where: { userId: session.user.id }
    });
    
    if (membership) {
      workspaceId = membership.workspaceId;
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated for session" }, { status: 400 });
    }

    // Run parallel distinct queries for each filter type
    const [sourceRows, statusRows, sentimentRows] = await Promise.all([
      prisma.feedback.findMany({
        where: { workspaceId },
        distinct: ['source'],
        select: { source: true }
      }),
      prisma.feedback.findMany({
        where: { workspaceId },
        distinct: ['status'],
        select: { status: true }
      }),
      prisma.feedback.findMany({
        where: { workspaceId },
        distinct: ['sentimentLabel'],
        select: { sentimentLabel: true }
      })
    ]);

    // Extract valid non-null strings
    const channels = sourceRows
      .map(row => row.source)
      .filter(val => val && val.trim().length > 0)
      .sort();
      
    const statuses = statusRows
      .map(row => row.status)
      .filter(val => val && val.trim().length > 0)
      .sort();
      
    const sentiments = sentimentRows
      .map(row => row.sentimentLabel)
      .filter(val => val && val.trim().length > 0)
      .sort();

    return NextResponse.json({ channels, statuses, sentiments }, { status: 200 });
  } catch (error) {
    console.error("Fetch filter values error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
