import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

// 1. GET - Retrieve workspace reports list
export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated for session" }, { status: 400 });
    }

    const items = await prisma.report.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" }
    });

    const formatted = items.map((r) => ({
      id: r.id,
      title: r.title,
      summary: r.summary,
      status: r.status === "READY" ? "Ready" : "Draft",
      date: new Date(r.createdAt).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric"
      })
    }));

    return NextResponse.json({ items: formatted }, { status: 200 });
  } catch (error) {
    console.error("Fetch reports error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 2. POST - Generate a new VOC report based on current feedback
export async function POST() {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const workspaceId = (session.user as any).workspaceId;
    if (!workspaceId) {
      return NextResponse.json({ error: "No workspace isolated for session" }, { status: 400 });
    }

    // Check feedback count
    const feedback = await prisma.feedback.findMany({
      where: { workspaceId }
    });

    if (feedback.length === 0) {
      return NextResponse.json(
        { error: "Cannot generate reports without workspace feedback." },
        { status: 400 }
      );
    }

    const reportTitle = `Voice of Customer Brief - ${new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })} (#${Math.floor(100 + Math.random() * 900)})`;

    // Construct a simple dynamic summary of the feedback
    const positiveCount = feedback.filter(f => f.sentiment !== null && f.sentiment > 0.1).length;
    const negativeCount = feedback.filter(f => f.sentiment !== null && f.sentiment < -0.1).length;
    const summaryText = `This report audits ${feedback.length} customer feedback items. We detected ${positiveCount} positive praise records and ${negativeCount} negative pain point categories. Focus recommended actions on performance optimization.`;

    const report = await prisma.report.create({
      data: {
        workspaceId,
        title: reportTitle,
        summary: summaryText,
        status: "READY"
      }
    });

    return NextResponse.json({ message: "Report generated successfully", item: report }, { status: 201 });
  } catch (error) {
    console.error("Generate report error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
