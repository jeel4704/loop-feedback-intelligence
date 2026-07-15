import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { checkDuplicateAgainstList, logDuplicateEvent, logDuplicateAuditRecord } from "@/lib/duplicate-detector";

function generateMockVector(): number[] {
  return Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 2);
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let workspaceId = (session.user as any).workspaceId;
  console.log('Import route - initial workspaceId from session:', workspaceId);
  // If workspaceId is missing or invalid, attempt to locate a workspace via membership
  let workspace = null;
  if (workspaceId) {
    workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  }
  if (!workspace) {
    // Fallback: find the first workspace the user belongs to
    const membership = await prisma.workspaceMembership.findFirst({
      where: { userId: session.user.id },
    });
    if (membership) {
      workspaceId = membership.workspaceId;
      workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
      console.log('Import route - fallback workspaceId from membership:', workspaceId);
    }
  }
  if (!workspace) {
    // Final fallback: pick any workspace (e.g., first) to allow import in demo
    const anyWorkspace = await prisma.workspace.findFirst();
    if (anyWorkspace) {
      workspaceId = anyWorkspace.id;
      workspace = anyWorkspace;
      console.log('Import route - using any workspace as fallback:', workspaceId);
    }
  }
  if (!workspace) {
    return NextResponse.json({ error: "Workspace not found for the current user" }, { status: 400 });
  }
  // At this point workspaceId is guaranteed to be valid

    const { items, workspaceId: bodyWorkspaceId } = await req.json();
    const effectiveWorkspaceId = workspaceId || bodyWorkspaceId;
    console.log('Import route - effective workspaceId:', effectiveWorkspaceId);
    
    // Use the effective workspace ID for all subsequent operations
    workspaceId = effectiveWorkspaceId;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items provided for import" }, { status: 400 });
    }

    // Fetch all existing feedbacks from the last 24 hours at the start of import to do checks in-memory
    const thresholdDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const existingFeedbacks = await prisma.feedback.findMany({
      where: { 
        workspaceId,
        createdAt: { gte: thresholdDate },
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

    // Fetch existing themes to avoid individual SELECT queries inside the loop
    const existingThemesList = await prisma.theme.findMany({
      where: { workspaceId }
    });
    
    // Track themes in-memory
    const themeMap = new Map<string, string>();
    existingThemesList.forEach(t => {
      themeMap.set(t.name.trim().toLowerCase(), t.id);
    });

    // Increase limit to 1000 items to support larger files
    const uploadLimit = 1000;
    const itemsToProcess = items.slice(0, uploadLimit);

    const importedItems = [];
    const skippedItems = [];
    const duplicateReports: any[] = [];
    const errors = [];
    const chunkSize = 30; // Increase chunk size for high-speed parallel insertions

    // Process rows in parallel chunks to avoid database locking/pool exhaustion
    for (let i = 0; i < itemsToProcess.length; i += chunkSize) {
      const chunk = itemsToProcess.slice(i, i + chunkSize);
      
      const results = await Promise.all(
        chunk.map(async (item) => {
          try {
            const content = item.content || "";
            if (!content.trim()) return null;

            const channelValue = item.channel ? String(item.channel).trim() : "CSV";

            const customerName = item.customerName || "Anonymous Customer";
            const customerEmail = item.customerEmail || "anonymous@customer.com";

            let possibleDuplicateOf: string | null = null;
            let possibleSimilarity: number | null = null;
            let initialStatus = item.status ? String(item.status).trim() : "New";

            // Enforce duplicate validation BEFORE database insertion (in-memory)
            const check = checkDuplicateAgainstList(content, customerName, customerEmail, existingFeedbacks);
            
            if (check.isDuplicate) {
              const oldOccurrences = check.existingFeedback.occurrenceCount || 1;
              const newOccurrences = oldOccurrences + 1;

              // Do not insert duplicate records. Instead, increase occurrenceCount of existing record.
              await prisma.feedback.update({
                where: { id: check.existingFeedback.id },
                data: {
                  occurrenceCount: newOccurrences,
                  lastReportedAt: new Date()
                }
              });

              // Update occurrenceCount in our in-memory list so next duplicates map correctly
              const matchedItem = existingFeedbacks.find(f => f.id === check.existingFeedback.id);
              if (matchedItem) {
                matchedItem.occurrenceCount = newOccurrences;
              }

              // Write event to ActivityLog
              await logDuplicateEvent(
                workspaceId,
                channelValue,
                check.existingFeedback.id,
                oldOccurrences,
                newOccurrences
              );

              const importedBy = session?.user?.name || session?.user?.email || "CSV Import";

              // Log details to hidden Duplicate Audit Log
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

              // Register details for download report matching request spec
              duplicateReports.push({
                feedback: content,
                matchedFeedbackId: check.existingFeedback.id,
                customer: customerName,
                similarityScore: check.similarityScore,
                theme: item.theme || "General",
                status: check.existingFeedback.status || "New",
                actionTaken: "Skipped & Merged",
                skippedReason: `${check.type === "EXACT" ? "Exact Match" : "Semantic Similarity"} (${Math.round(check.similarityScore * 100)}%)`,
                timestamp: new Date().toISOString()
              });

              return { skipped: true };
            } else if (check.isPossibleDuplicate) {
              possibleDuplicateOf = check.existingFeedback.id;
              possibleSimilarity = check.similarityScore;
              initialStatus = "Possible Duplicate";
            }

            // Dynamic sentiment calculation
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

            // Dynamic intent calculation
            let intent = "Question";
            if (lowercaseContent.includes("bug") || lowercaseContent.includes("crash") || lowercaseContent.includes("error")) {
              intent = "Bug";
            } else if (lowercaseContent.includes("add") || lowercaseContent.includes("feature") || lowercaseContent.includes("integrate")) {
              intent = "Feature Request";
            } else if (lowercaseContent.includes("love") || lowercaseContent.includes("amazing") || lowercaseContent.includes("thanks")) {
              intent = "Praise";
            }

            const title = item.title || content.split(" ").slice(0, 5).join(" ") + "...";

            // Create the feedback and its vector embedding in a micro-transaction
            const createdRecord = await prisma.$transaction(async (tx) => {
              const created = await tx.feedback.create({
                data: {
                  workspaceId,
                  title,
                  content,
                  sentiment: sentimentScore,
                  sentimentLabel,
                  intent,
                  tags: intent !== "Question" ? [intent] : [],
                  source: item.channel ? String(item.channel).trim() : "CSV",
                  status: initialStatus,
                  customerName,
                  customerEmail,
                  duplicateOf: possibleDuplicateOf,
                  similarityScore: possibleSimilarity
                }
              });

              // Dynamically map and associate theme clusters from CSV (in-memory optimized)
              const rawTheme = item.theme ? String(item.theme).trim() : "";
              if (rawTheme) {
                const key = rawTheme.toLowerCase();
                let themeId = themeMap.get(key);

                if (!themeId) {
                  const newTheme = await tx.theme.create({
                    data: {
                      name: rawTheme,
                      workspaceId,
                      description: `Auto-generated category cluster for "${rawTheme}" feedback.`
                    }
                  });
                  themeId = newTheme.id;
                  themeMap.set(key, themeId);
                }

                await tx.feedbackTheme.create({
                  data: {
                    feedbackId: created.id,
                    themeId
                  }
                });
              }

              // Insert pgvector embedding
              const embId = `emb_${Math.random().toString(36).substr(2, 9)}`;
              const vector = generateMockVector();
              const vectorString = `[${vector.join(",")}]`;
              await tx.$executeRawUnsafe(
                `INSERT INTO "Embedding" ("id", "feedbackId", "vector") VALUES ($1, $2, $3::vector) ON CONFLICT ("feedbackId") DO NOTHING;`,
                embId,
                created.id,
                vectorString
              );

              return created;
            });

            // Add newly created feedback to our in-memory list for future duplicate matching in this run
            if (createdRecord && !possibleDuplicateOf) {
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

      // Collect results and errors
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

    if (importedItems.length === 0 && errors.length > 0) {
      return NextResponse.json({ error: `Failed to import feedback: ${errors[0]}` }, { status: 400 });
    }

    return NextResponse.json({
      message: "CSV Import Completed",
      total: itemsToProcess.length,
      imported: importedItems.length,
      duplicates: duplicateReports.length,
      failed: errors.length,
      report: duplicateReports
    }, { status: 201 });
  } catch (error) {
    console.error("CSV Import error:", error);
    return NextResponse.json({ error: "Failed to import CSV feedback" }, { status: 500 });
  }
}
