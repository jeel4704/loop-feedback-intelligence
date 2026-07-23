export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { checkDuplicateAgainstList, logDuplicateEvent, logDuplicateAuditRecord } from "@/lib/duplicate-detector";
import { revalidatePath } from "next/cache";

function generateMockVector(): number[] {
  return Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 2);
}

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let workspaceId = (session.user as any).workspaceId;
    let workspace = null;
    if (workspaceId) {
      workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    }
    if (!workspace) {
      const membership = await prisma.workspaceMembership.findFirst({
        where: { userId: session.user.id },
      });
      if (membership) {
        workspaceId = membership.workspaceId;
        workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
      }
    }
    if (!workspace) {
      const anyWorkspace = await prisma.workspace.findFirst();
      if (anyWorkspace) {
        workspaceId = anyWorkspace.id;
        workspace = anyWorkspace;
      }
    }
    if (!workspace) {
      return NextResponse.json({ error: "Workspace not found for the current user" }, { status: 400 });
    }

    const { items, importMode, fileName, fileSize } = await req.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No valid items provided for import" }, { status: 400 });
    }

    // 1. Handle REPLACE Mode
    if (importMode === "REPLACE") {
      await prisma.feedback.deleteMany({
        where: { workspaceId }
      });
      
      await prisma.activityLog.create({
        data: {
          workspaceId,
          label: "Administrator triggered a complete Replace of all feedback datasets via CSV Import.",
          timeLabel: "Just now"
        }
      });
    }

    // 2. Create the Import record FIRST so we have an importId
    const currentImport = await prisma.import.create({
      data: {
        workspaceId,
        fileName: fileName || "CSV_Upload",
        fileSize: fileSize || 0,
        importedBy: session.user.id || "system",
        validRecords: 0,
        invalidRecords: 0,
        duration: 0,
        source: "CSV Enterprise Engine",
        status: "PROCESSING"
      }
    });

    // 3. Fetch existing feedbacks for duplicate checking (Append mode or after Replace)
    const existingFeedbacks = await prisma.feedback.findMany({
      where: { 
        workspaceId,
        duplicateOf: null
      },
      select: {
        id: true,
        content: true,
        title: true,
        status: true,
        createdAt: true,
        customerName: true,
        customerEmail: true,
        sentimentLabel: true,
        intent: true,
        occurrenceCount: true
      }
    });

    // 4. Fetch themes for mapping
    const existingThemesList = await prisma.theme.findMany({
      where: { workspaceId }
    });
    
    const themeMap = new Map<string, string>();
    existingThemesList.forEach(t => {
      themeMap.set(t.name.trim().toLowerCase(), t.id);
    });

    const importedItems = [];
    const skippedItems = [];
    const duplicateReports: any[] = [];
    const errors = [];
    const chunkSize = 30; 

    // We process sequentially by chunk to handle the in-memory existingFeedbacks list cleanly
    for (let i = 0; i < items.length; i += chunkSize) {
      const chunk = items.slice(i, i + chunkSize);
      
      const results = await Promise.all(
        chunk.map(async (item) => {
          try {
            const content = item.Feedback || "";
            if (!content.trim()) return null;

            const channelValue = item.Channel || "CSV Import";
            const customerName = item.Name || "Unknown User";
            const customerEmail = `${customerName.toLowerCase().replace(/\s+/g, ".")}@customer.com`;
            let initialStatus = item.Status || "Open";
            let providedDate = item.Date || new Date().toISOString();

            let possibleDuplicateOf: string | null = null;
            let possibleSimilarity: number | null = null;

            // Enforce duplicate validation BEFORE database insertion
            const check = checkDuplicateAgainstList(content, customerName, customerEmail, existingFeedbacks);
            
            if (check.isDuplicate) {
              const oldOccurrences = check.existingFeedback.occurrenceCount || 1;
              const newOccurrences = oldOccurrences + 1;

              await prisma.feedback.update({
                where: { id: check.existingFeedback.id },
                data: {
                  occurrenceCount: newOccurrences,
                  lastReportedAt: new Date(providedDate)
                }
              });

              const matchedItem = existingFeedbacks.find(f => f.id === check.existingFeedback.id);
              if (matchedItem) {
                matchedItem.occurrenceCount = newOccurrences;
              }

              await logDuplicateEvent(
                workspaceId,
                channelValue,
                check.existingFeedback.id,
                oldOccurrences,
                newOccurrences
              );

              const importedBy = session?.user?.name || session?.user?.email || "CSV Import";

              await logDuplicateAuditRecord({
                workspaceId,
                feedbackContent: content,
                existingFeedbackId: check.existingFeedback.id,
                customerName,
                sourceChannel: channelValue,
                similarityScore: check.similarityScore,
                detectionMethod: check.type || "EXACT",
                importedBy,
                actionTaken: "Skipped & Merged"
              });

              duplicateReports.push({
                feedback: content,
                matchedFeedbackId: check.existingFeedback.id,
                customer: customerName,
                similarityScore: check.similarityScore,
                theme: item.Theme || "General",
                status: check.existingFeedback.status || "New",
                actionTaken: "Skipped & Merged",
                skippedReason: `${check.type === "EXACT" ? "Exact Match" : "Semantic Similarity"}`,
                timestamp: new Date().toISOString()
              });

              return { skipped: true };
            }

            // Dynamic sentiment calculation (Fallback if not provided)
            let sentimentLabel = item.Sentiment || "Neutral";
            let sentimentScore = 0.0;
            
            if (sentimentLabel.toLowerCase() === "positive") sentimentScore = 0.8;
            if (sentimentLabel.toLowerCase() === "negative") sentimentScore = -0.8;
            
            if (!item.Sentiment) {
              const lowercaseContent = content.toLowerCase();
              const positiveWords = ["love", "great", "excellent", "fast", "helpful", "good", "amazing"];
              const negativeWords = ["slow", "bug", "crash", "error", "fail", "freeze", "bad", "broke"];
              let posCount = 0; let negCount = 0;
              positiveWords.forEach(w => { if (lowercaseContent.includes(w)) posCount++; });
              negativeWords.forEach(w => { if (lowercaseContent.includes(w)) negCount++; });
              if (posCount > negCount) { sentimentScore = 0.8; sentimentLabel = "Positive"; }
              else if (negCount > posCount) { sentimentScore = -0.8; sentimentLabel = "Negative"; }
            }

            // Fallback Theme
            const rawTheme = item.Theme ? String(item.Theme).trim() : "General";

            const title = content.split(" ").slice(0, 5).join(" ") + "...";

            const createdRecord = await prisma.$transaction(async (tx) => {
              const created = await tx.feedback.create({
                data: {
                  workspaceId,
                  title,
                  content,
                  sentiment: sentimentScore,
                  sentimentLabel,
                  intent: rawTheme,
                  tags: [rawTheme],
                  source: channelValue,
                  status: initialStatus,
                  customerName,
                  customerEmail,
                  duplicateOf: possibleDuplicateOf,
                  similarityScore: possibleSimilarity,
                  createdAt: new Date(providedDate),
                  importId: currentImport.id // SET IMPORT ID HERE!
                }
              });

              const key = rawTheme.toLowerCase();
              let themeId = themeMap.get(key);

              if (!themeId) {
                const newTheme = await tx.theme.create({
                  data: {
                    name: rawTheme,
                    workspaceId,
                    description: `Category cluster for "${rawTheme}" feedback.`
                  }
                });
                themeId = newTheme.id;
                themeMap.set(key, themeId);
              }

              await tx.feedbackTheme.create({
                data: { feedbackId: created.id, themeId }
              });

              const embId = `emb_${Math.random().toString(36).substr(2, 9)}`;
              const vector = generateMockVector();
              const vectorString = `[${vector.join(",")}]`;
              await tx.$executeRawUnsafe(
                `INSERT INTO "Embedding" ("id", "feedbackId", "vector") VALUES ($1, $2, $3::vector) ON CONFLICT ("feedbackId") DO NOTHING;`,
                embId, created.id, vectorString
              );

              return created;
            });

            if (createdRecord) {
              existingFeedbacks.push({
                id: createdRecord.id,
                content: createdRecord.content,
                title: createdRecord.title,
                status: createdRecord.status,
                createdAt: createdRecord.createdAt,
                customerName: createdRecord.customerName,
                customerEmail: createdRecord.customerEmail,
                sentimentLabel: createdRecord.sentimentLabel,
                intent: createdRecord.intent,
                occurrenceCount: 1
              });
            }

            return createdRecord;
          } catch (err: any) {
            console.error("Individual row import failed:", err);
            return err;
          }
        })
      );

      for (const res of results) {
        if (res) {
          if (res instanceof Error) {
            errors.push(res.message || "Unknown error");
          } else if ((res as any).skipped) {
            skippedItems.push(res);
          } else {
            importedItems.push(res);
          }
        }
      }
    }

    const duration = Math.round((Date.now() - startTime) / 1000); // seconds

    // Save final Import status
    await prisma.import.update({
      where: { id: currentImport.id },
      data: {
        validRecords: importedItems.length,
        invalidRecords: errors.length + duplicateReports.length, // duplicates count as invalid/skipped
        duration,
        status: errors.length === items.length ? "FAILED" : "COMPLETED"
      }
    });

    if (importedItems.length > 0) {
      await prisma.activityLog.create({
        data: {
          workspaceId,
          label: `Imported ${importedItems.length} records from ${fileName || 'CSV'}.`,
          timeLabel: "Just now"
        }
      });
    }

    revalidatePath("/feedback");

    return NextResponse.json({
      success: true,
      imported: importedItems.length,
      errors: errors.length,
      skipped: skippedItems.length,
      duplicateReports,
      errorDetails: errors.slice(0, 10)
    });
  } catch (error: any) {
    console.error("Enterprise CSV Upload API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to process import" }, { status: 500 });
  }
}
