export const dynamic = "force-dynamic";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { checkForDuplicate, logDuplicateEvent, logDuplicateAuditRecord } from "@/lib/duplicate-detector";

// Helper to generate a random 1536-dimensional mock float vector for pgvector RAG
function generateMockVector(): number[] {
  return Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 2);
}

// 1. GET - Retrieve workspace feedback entries (Tenant isolated)
export async function GET(req: Request) {
  try {
    const session = await auth();
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

    const { searchParams } = new URL(req.url);
    const sentiment = searchParams.get("sentiment");
    const channel = searchParams.get("channel");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const search = searchParams.get("search") || "";

    const skip = (page - 1) * limit;

    // Build filter query
    const where: any = { workspaceId };
    if (sentiment && sentiment !== "all") {
      where.sentimentLabel = sentiment;
    }
    if (channel && channel !== "all") {
      where.source = {
        equals: channel,
        mode: "insensitive"
      };
    }
    if (status && status !== "all") {
      where.status = {
        equals: status,
        mode: "insensitive"
      };
    }
    
    if (search) {
      where.OR = [
        { customerName: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await prisma.$transaction([
      prisma.feedback.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: { themes: { include: { theme: true } } }
      }),
      prisma.feedback.count({ where })
    ]);

    return NextResponse.json({ items, total }, { status: 200 });
  } catch (error) {
    console.error("Fetch feedback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// 2. POST - Insert a new customer feedback entry manually
export async function POST(req: Request) {
  try {
    const session = await auth();
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

    const { content, channel, customerLabel, title, override, similarityScore, duplicateOf } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Feedback content is required" }, { status: 400 });
    }

    const sourceValue = channel ? String(channel).trim() : "MANUAL";
    const userRole = (session.user as any).role || "VIEWER";
    const isAdmin = userRole === "OWNER" || userRole === "ADMIN";

    // Split customer label into name & details first so it's ready for duplicate validation
    let customerName = customerLabel || "Anonymous Customer";
    let customerEmail = "anonymous@customer.com";
    if (customerLabel && customerLabel.includes("-")) {
      const parts = customerLabel.split("-");
      customerName = parts[0].trim();
      customerEmail = `${customerName.toLowerCase().replace(/\s+/g, ".")}@customer.com`;
    }

    let possibleDuplicateOf: string | null = null;
    let possibleSimilarity: number | null = null;
    let initialStatus = "New";

    // 1. Duplicate detection check (if not overridden by admin)
    if (!override) {
      const check = await checkForDuplicate(workspaceId, content, customerName, customerEmail);
      
      if (check.isDuplicate) {
        // Auto-merge & increment count for ALL sources (including manual, API, CSV, etc.)
        const oldOccurrences = check.existingFeedback.occurrenceCount || 1;
        const newOccurrences = oldOccurrences + 1;

        await prisma.feedback.update({
          where: { id: check.existingFeedback.id },
          data: {
            occurrenceCount: newOccurrences,
            lastReportedAt: new Date(),
            source: sourceValue
          }
        });

        const importedBy = session?.user?.name || session?.user?.email || "System Ingestion";

        // Create the hidden Duplicate Audit Log
        await logDuplicateAuditRecord({
          workspaceId,
          feedbackContent: content,
          existingFeedbackId: check.existingFeedback.id,
          customerName,
          sourceChannel: sourceValue,
          similarityScore: check.similarityScore,
          detectionMethod: check.type || "EXACT",
          importedBy,
          actionTaken: "Skipped & Merged"
        });

        // Write event to normal ActivityLog
        await logDuplicateEvent(
          workspaceId,
          sourceValue,
          check.existingFeedback.id,
          oldOccurrences,
          newOccurrences
        );

        return NextResponse.json({
          duplicateSkipped: true,
          message: "Duplicate feedback detected. Skip-merged successfully.",
          existingFeedback: check.existingFeedback,
          similarityScore: check.similarityScore,
          type: check.type
        }, { status: 200 });
      } else if (check.isPossibleDuplicate) {
        // If it is between 85% and 95%, save it as a "Possible Duplicate" for moderator review
        possibleDuplicateOf = check.existingFeedback.id;
        possibleSimilarity = check.similarityScore;
        initialStatus = "Possible Duplicate";
      }
    } else {
      // If admin tries to override, confirm permissions
      if (!isAdmin) {
        return NextResponse.json({ error: "Only administrators can override duplicate detection warnings." }, { status: 403 });
      }
    }

    // Simple keyword sentiment analyzer
    let sentimentScore = 0.0;
    let sentimentLabel = "Neutral";
    const lowercaseContent = content.toLowerCase();
    const positiveWords = ["love", "great", "excellent", "fast", "helpful", "good", "amazing", "smooth"];
    const negativeWords = ["slow", "bug", "crash", "error", "fail", "freeze", "bad", "broke", "expensive"];
    
    let posCount = 0;
    let negCount = 0;
    positiveWords.forEach(w => { if (lowercaseContent.includes(w)) posCount++; });
    negativeWords.forEach(w => { if (lowercaseContent.includes(w)) negCount++; });

    if (posCount > negCount) {
      sentimentScore = 0.8;
      sentimentLabel = "Positive";
    } else if (negCount > posCount) {
      sentimentScore = -0.8;
      sentimentLabel = "Negative";
    }

    // Simple intent categorizer
    let intent = "Question";
    if (lowercaseContent.includes("bug") || lowercaseContent.includes("crash") || lowercaseContent.includes("error")) {
      intent = "Bug";
    } else if (lowercaseContent.includes("add") || lowercaseContent.includes("feature") || lowercaseContent.includes("integrate")) {
      intent = "Feature Request";
    } else if (lowercaseContent.includes("love") || lowercaseContent.includes("amazing") || lowercaseContent.includes("thanks")) {
      intent = "Praise";
    }

    const feedbackTitle = title || content.split(" ").slice(0, 5).join(" ") + "...";

    // Insert record in a transaction
    const feedback = await prisma.$transaction(async (tx) => {
      const fb = await tx.feedback.create({
        data: {
          workspaceId,
          title: feedbackTitle,
          content,
          sentiment: sentimentScore,
          sentimentLabel,
          intent,
          tags: intent !== "Question" ? [intent] : [],
          source: sourceValue,
          status: override ? "New" : initialStatus,
          customerName,
          customerEmail,
          duplicateOf: override && duplicateOf ? String(duplicateOf) : possibleDuplicateOf,
          similarityScore: override && similarityScore ? parseFloat(similarityScore) : possibleSimilarity
        }
      });

      // Create vector embedding record using raw SQL for pgvector compatibility
      const embId = `emb_${Math.random().toString(36).substr(2, 9)}`;
      const vector = generateMockVector();
      const vectorString = `[${vector.join(",")}]`;
      await tx.$executeRawUnsafe(
        `INSERT INTO "Embedding" ("id", "feedbackId", "vector") VALUES ($1, $2, $3::vector) ON CONFLICT ("feedbackId") DO NOTHING;`,
        embId,
        fb.id,
        vectorString
      );

      return fb;
    });

    return NextResponse.json({ 
      message: possibleDuplicateOf ? "Feedback saved as Possible Duplicate for review" : "Feedback saved successfully", 
      item: feedback,
      possibleDuplicate: possibleDuplicateOf !== null
    }, { status: 201 });
  } catch (error) {
    console.error("Save feedback error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
