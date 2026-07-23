export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request) {
  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      const membership = await prisma.workspaceMembership.findFirst({
        where: { userId: session.user.id }
      });
      if (membership) workspaceId = membership.workspaceId;
    }

    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated" }, { status: 400 });
    }

    const userRole = (session.user as any).role || "VIEWER";
    const isOwnerOrAdmin = userRole === "OWNER" || userRole === "ADMIN";

    if (!isOwnerOrAdmin) {
      return NextResponse.json({ error: "Access denied. Only owners and administrators can access duplicate logs." }, { status: 403 });
    }

    const rawLogs = await prisma.activityLog.findMany({
      where: {
        workspaceId,
        label: { startsWith: "DUPLICATE_AUDIT:" }
      },
      orderBy: { createdAt: "desc" }
    });

    const logs = rawLogs.map((log) => {
      try {
        const jsonStr = log.label.substring("DUPLICATE_AUDIT:".length);
        const data = JSON.parse(jsonStr);
        return {
          id: log.id,
          createdAt: log.createdAt,
          ...data
        };
      } catch (err) {
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({ logs }, { status: 200 });
  } catch (error) {
    console.error("Duplicate logs fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
