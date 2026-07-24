export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function POST(req: Request) {
  const session = await auth();
  try {
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (session.user as any).role || "VIEWER";
    const isAdminOrAnalyst = userRole === "OWNER" || userRole === "ADMIN" || userRole === "ANALYST";

    if (!isAdminOrAnalyst) {
      return NextResponse.json({ error: "Only administrators and analysts can resolve duplicate warnings." }, { status: 403 });
    }

    const { feedbackId, resolution } = await req.json();

    if (!feedbackId || !resolution) {
      return NextResponse.json({ error: "Missing feedbackId or resolution status" }, { status: 400 });
    }

    const possibleDuplicate = await prisma.feedback.findUnique({
      where: { id: feedbackId }
    });

    if (!possibleDuplicate) {
      return NextResponse.json({ error: "Feedback record not found" }, { status: 404 });
    }

    if (resolution === "MERGE") {
      const parentId = possibleDuplicate.duplicateOf;
      if (!parentId) {
        return NextResponse.json({ error: "This record is not marked as a duplicate of another feedback." }, { status: 400 });
      }

      const parent = await prisma.feedback.findUnique({
        where: { id: parentId }
      });

      if (!parent) {
        return NextResponse.json({ error: "Original parent feedback record not found" }, { status: 404 });
      }

      const oldOccurrences = parent.occurrenceCount || 1;
      const newOccurrences = oldOccurrences + (possibleDuplicate.occurrenceCount || 1);

      await prisma.$transaction(async (tx) => {
        // Update parent count
        await tx.feedback.update({
          where: { id: parent.id },
          data: {
            occurrenceCount: newOccurrences,
            lastReportedAt: new Date()
          }
        });

        // Delete duplicate
        await tx.feedback.delete({
          where: { id: possibleDuplicate.id }
        });

        // Log event
        const cleanSource = possibleDuplicate.source.charAt(0).toUpperCase() + possibleDuplicate.source.slice(1).toLowerCase();
        const label = `Duplicate feedback #${possibleDuplicate.id.substring(0, 8)} removed from ${cleanSource}. Merged into Feedback #${parent.id.substring(0, 8)}.`;
        await tx.activityLog.create({
          data: {
            workspaceId: possibleDuplicate.workspaceId,
            label,
            timeLabel: "Just now"
          }
        });
      });

      return NextResponse.json({ 
        success: true, 
        message: `Successfully merged feedback #${possibleDuplicate.id.substring(0, 8)} into #${parent.id.substring(0, 8)}.` 
      }, { status: 200 });
    } 
    
    if (resolution === "KEEP") {
      await prisma.feedback.update({
        where: { id: possibleDuplicate.id },
        data: {
          status: "New",
          duplicateOf: null,
          similarityScore: null
        }
      });

      return NextResponse.json({ 
        success: true, 
        message: `Successfully marked feedback #${possibleDuplicate.id.substring(0, 8)} as unique.` 
      }, { status: 200 });
    }

    return NextResponse.json({ error: "Invalid resolution option" }, { status: 400 });
  } catch (error) {
    console.error("Resolve duplicate error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
