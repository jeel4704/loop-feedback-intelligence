export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function GET(req: Request,  context: { params: { id: string } }) {
  if (process.env.npm_lifecycle_event === "build") return NextResponse.json([]);

  const params = context?.params || ({} as any);
  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaceId = params.id;

    // Verify membership
    const membership = await prisma.workspaceMembership.findFirst({
      where: { userId, workspaceId }
    });

    if (!membership) {
      return NextResponse.json({ error: "Access denied to this workspace." }, { status: 403 });
    }

    // Fetch workspace
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                createdAt: true
              }
            }
          }
        },
        _count: {
          select: {
            feedback: true,
            reports: true,
            themes: true
          }
        }
      }
    });

    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    // 1. Fetch Feedbacks statistics
    const feedbacksCount = workspace._count.feedback;
    
    // Group by sentiment labels
    const sentiments = await prisma.feedback.groupBy({
      by: ["sentimentLabel"],
      where: { workspaceId },
      _count: true
    });

    let positiveCount = 0;
    let negativeCount = 0;
    let neutralCount = 0;

    sentiments.forEach((s) => {
      const label = (s.sentimentLabel || "").toUpperCase();
      if (label === "POSITIVE" || label === "GOOD") positiveCount += s._count;
      else if (label === "NEGATIVE" || label === "BAD") negativeCount += s._count;
      else neutralCount += s._count;
    });

    // 2. Fetch Reports lists
    const reports = await prisma.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 10
    });

    // 3. Fetch Themes distribution list
    const themes = await prisma.theme.findMany({
      where: { workspaceId },
      include: {
        _count: {
          select: { feedback: true }
        }
      }
    });

    // 4. Fetch Activity Logs
    const activities = await prisma.activityLog.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 15
    });

    // 5. Fetch feedback channel distribution
    const sourceBreakdown = await prisma.feedback.groupBy({
      by: ["source"],
      where: { workspaceId },
      _count: true
    });

    // 6. Generate feedback trend over past 7 days
    const pastDays = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split("T")[0];
    }).reverse();

    const feedbacks = await prisma.feedback.findMany({
      where: { 
        workspaceId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      },
      select: { createdAt: true }
    });

    const trend = pastDays.map(day => {
      const count = feedbacks.filter(f => f.createdAt.toISOString().split("T")[0] === day).length;
      return { date: day, count };
    });

    // Owner details
    const ownerMember = workspace.members.find(m => m.role === "OWNER");

    // Connected Integrations List (Removed)
    const integrations: any[] = [];

    // Fetch actual imports history
    const dbImports = await prisma.import.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const imports = dbImports.map((i) => ({
      filename: i.fileName,
      rows: i.validRecords + i.invalidRecords,
      failed: i.invalidRecords,
      status: i.status === "COMPLETED" ? "Success" : i.status === "FAILED" ? "Failed" : "Warning",
      date: new Date(i.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    }));

    return NextResponse.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        createdAt: workspace.createdAt,
        owner: ownerMember?.user?.name || "Jeel Patel",
        plan: "Enterprise",
        storageUsed: `${(feedbacksCount * 1.25).toFixed(1)} MB`,
        storageLimit: "10 GB",
        status: "Active"
      },
      statistics: {
        totalFeedback: feedbacksCount,
        positiveFeedback: positiveCount,
        negativeFeedback: negativeCount,
        neutralFeedback: neutralCount,
        totalReports: workspace._count.reports,
        totalThemes: workspace._count.themes,
        connectedIntegrations: integrations.length
      },
      members: workspace.members.map(m => ({
        id: m.userId,
        name: m.user.name || "Invite Pending",
        email: m.user.email,
        role: m.role,
        joinedDate: m.createdAt,
        status: "Active"
      })),
      reports: reports.map(r => ({
        id: r.id,
        title: r.title,
        status: r.status,
        createdAt: r.createdAt,
        createdBy: ownerMember?.user?.name || "Jeel Patel"
      })),
      themes: themes.map(t => ({
        id: t.id,
        name: t.name,
        feedbackCount: t._count.feedback,
        createdAt: t.createdAt
      })),
      activities: activities.map(act => ({
        id: act.id,
        action: act.label,
        relativeTime: act.timeLabel,
        createdAt: act.createdAt
      })),
      charts: {
        trend,
        sources: sourceBreakdown.map(s => ({ source: s.source, count: s._count })),
        sentiments: [
          { label: "Positive", count: positiveCount },
          { label: "Negative", count: negativeCount },
          { label: "Neutral", count: neutralCount }
        ]
      },
      integrations,
      imports
    });
  } catch (error) {
    console.error("GET workspace details API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT - Update/Archive workspace metadata
export async function PUT(req: Request,  context: { params: { id: string } }) {
  const params = context?.params || ({} as any);
  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaceId = params.id;

    // Check OWNER/ADMIN role
    const member = await prisma.workspaceMembership.findFirst({
      where: { userId, workspaceId }
    });

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN")) {
      return NextResponse.json({ error: "Access denied. Admin rights required." }, { status: 403 });
    }

    const { name, slug } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ error: "Workspace parameters are required." }, { status: 400 });
    }

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { name, slug }
    });

    await prisma.activityLog.create({
      data: {
        workspaceId,
        label: `Workspace details updated (Name: "${name}")`,
        timeLabel: "Just now"
      }
    });

    return NextResponse.json({
      message: "Workspace updated successfully.",
      workspace: updated
    });
  } catch (error) {
    console.error("PUT update workspace API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE - Archive/Delete workspace
export async function DELETE(req: Request,  context: { params: { id: string } }) {
  const params = context?.params || ({} as any);
  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const workspaceId = params.id;

    // Only OWNER can delete workspace
    const member = await prisma.workspaceMembership.findFirst({
      where: { userId, workspaceId }
    });

    if (!member || member.role !== "OWNER") {
      return NextResponse.json({ error: "Only workspace OWNER can delete a workspace." }, { status: 403 });
    }

    await prisma.workspace.delete({
      where: { id: workspaceId }
    });

    return NextResponse.json({
      message: "Workspace deleted successfully."
    });
  } catch (error) {
    console.error("DELETE workspace API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
