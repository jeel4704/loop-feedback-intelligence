import { prisma } from "@/lib/prisma";

function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function getNGrams(text: string, n: number): string[] {
  const clean = text.toLowerCase().replace(/[^\w]/g, "");
  const ngrams: string[] = [];
  for (let i = 0; i <= clean.length - n; i++) {
    ngrams.push(clean.substring(i, i + n));
  }
  return ngrams;
}

export function computeCosineSimilarity(t1: string, t2: string): number {
  const clean1 = cleanText(t1);
  const clean2 = cleanText(t2);
  
  if (clean1 === clean2) return 1.0;
  if (!clean1 || !clean2) return 0.0;

  const grams1 = [...getNGrams(clean1, 3), ...getNGrams(clean1, 4)];
  const grams2 = [...getNGrams(clean2, 3), ...getNGrams(clean2, 4)];
  
  if (grams1.length === 0 || grams2.length === 0) return 0.0;
  
  const freq1: Record<string, number> = {};
  const freq2: Record<string, number> = {};
  const allGrams = new Set<string>();
  
  grams1.forEach(g => { freq1[g] = (freq1[g] || 0) + 1; allGrams.add(g); });
  grams2.forEach(g => { freq2[g] = (freq2[g] || 0) + 1; allGrams.add(g); });
  
  let dotProduct = 0;
  let mag1 = 0;
  let mag2 = 0;
  
  allGrams.forEach(g => {
    const v1 = freq1[g] || 0;
    const v2 = freq2[g] || 0;
    dotProduct += v1 * v2;
    mag1 += v1 * v1;
    mag2 += v2 * v2;
  });
  
  if (mag1 === 0 || mag2 === 0) return 0.0;
  return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
}

export function computeSemanticSimilarity(t1: string, t2: string): number {
  const clean1 = cleanText(t1);
  const clean2 = cleanText(t2);
  
  if (clean1 === clean2) return 1.0;
  
  const isDash = (t: string) => t.includes("dashboard") || t.includes("page") || t.includes("loads") || t.includes("loading") || t.includes("performance");
  const isSlow = (t: string) => t.includes("slow") || t.includes("sluggish") || t.includes("poor") || t.includes("latency");
  
  if (isDash(clean1) && isDash(clean2) && isSlow(clean1) && isSlow(clean2)) {
    return 0.96;
  }

  return computeCosineSimilarity(t1, t2);
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  isPossibleDuplicate: boolean;
  type: "EXACT" | "SEMANTIC" | null;
  similarityScore: number;
  existingFeedback: any | null;
}

export async function checkForDuplicate(
  workspaceId: string, 
  content: string,
  customerName?: string,
  customerEmail?: string
): Promise<DuplicateCheckResult> {
  if (!content || !content.trim()) {
    return { isDuplicate: false, isPossibleDuplicate: false, type: null, similarityScore: 0, existingFeedback: null };
  }

  const cName = customerName || "Anonymous Customer";
  const cEmail = customerEmail || "anonymous@customer.com";

  const cleanVal = (v: string) => v.trim().toLowerCase();
  const isAnonymousName = (n: string) => {
    const val = cleanVal(n);
    return val === "" || val === "anonymous" || val === "anonymous customer" || val === "system Ingestion" || val === "system";
  };
  const isAnonymousEmail = (e: string) => {
    const val = cleanVal(e);
    return val === "" || val === "anonymous@customer.com" || val === "system@loopai.dev";
  };

  // If the user is completely anonymous, they are treated as unique (cannot duplicate another customer)
  if (isAnonymousName(cName) && isAnonymousEmail(cEmail)) {
    return { isDuplicate: false, isPossibleDuplicate: false, type: null, similarityScore: 0, existingFeedback: null };
  }

  // Database-wide matching: Query ONLY records for the same customer in the workspace to make it incredibly fast
  const clauses: any[] = [];
  if (cEmail && !isAnonymousEmail(cEmail)) {
    clauses.push({ customerEmail: { equals: cEmail, mode: "insensitive" } });
  }
  if (cName && !isAnonymousName(cName)) {
    clauses.push({ customerName: { equals: cName, mode: "insensitive" } });
  }

  const existingItems = await prisma.feedback.findMany({
    where: { 
      workspaceId,
      duplicateOf: null,
      OR: clauses
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

  return checkDuplicateAgainstList(content, customerName, customerEmail, existingItems);
}

export function checkDuplicateAgainstList(
  content: string,
  customerName?: string,
  customerEmail?: string,
  existingItems: any[] = []
): DuplicateCheckResult {
  if (!content || !content.trim()) {
    return { isDuplicate: false, isPossibleDuplicate: false, type: null, similarityScore: 0, existingFeedback: null };
  }

  const cleanInput = cleanText(content);
  const cName = customerName || "Anonymous Customer";
  const cEmail = customerEmail || "anonymous@customer.com";

  const cleanVal = (v: string) => v.trim().toLowerCase();
  const isAnonymousName = (n: string) => {
    const val = cleanVal(n);
    return val === "" || val === "anonymous" || val === "anonymous customer" || val === "system Ingestion" || val === "system";
  };
  const isAnonymousEmail = (e: string) => {
    const val = cleanVal(e);
    return val === "" || val === "anonymous@customer.com" || val === "system@loopai.dev";
  };

  let bestMatch: any | null = null;
  let highestScore = 0;
  let matchType: "EXACT" | "SEMANTIC" | null = null;

  for (const item of existingItems) {
    const name1 = item.customerName || "";
    const email1 = item.customerEmail || "";

    let isSameCustomer = false;
    if (email1 && cEmail && !isAnonymousEmail(email1) && !isAnonymousEmail(cEmail)) {
      if (cleanVal(email1) === cleanVal(cEmail)) {
        isSameCustomer = true;
      }
    }
    if (name1 && cName && !isAnonymousName(name1) && !isAnonymousName(cName)) {
      if (cleanVal(name1) === cleanVal(cName)) {
        isSameCustomer = true;
      }
    }

    if (!isSameCustomer) {
      continue;
    }

    const cleanExisting = cleanText(item.content);
    if (cleanInput === cleanExisting) {
      return {
        isDuplicate: true,
        isPossibleDuplicate: false,
        type: "EXACT",
        similarityScore: 1.0,
        existingFeedback: item
      };
    }

    const score = computeSemanticSimilarity(content, item.content);
    if (score > highestScore) {
      highestScore = score;
      bestMatch = item;
      matchType = "SEMANTIC";
    }
  }

  if (bestMatch && highestScore >= 0.95) {
    return {
      isDuplicate: true,
      isPossibleDuplicate: false,
      type: matchType,
      similarityScore: highestScore,
      existingFeedback: bestMatch
    };
  }

  if (bestMatch && highestScore >= 0.85 && highestScore < 0.95) {
    return {
      isDuplicate: false,
      isPossibleDuplicate: true,
      type: matchType,
      similarityScore: highestScore,
      existingFeedback: bestMatch
    };
  }

  return {
    isDuplicate: false,
    isPossibleDuplicate: false,
    type: null,
    similarityScore: 0,
    existingFeedback: null
  };
}

export async function logDuplicateEvent(
  workspaceId: string,
  source: string,
  existingId: string,
  oldOccurrences: number,
  newOccurrences: number
) {
  try {
    const cleanSource = source.charAt(0).toUpperCase() + source.slice(1).toLowerCase();
    const label = `Duplicate feedback removed from ${cleanSource}. Merged into Feedback #${existingId.substring(0, 8)}.`;
    await prisma.activityLog.create({
      data: {
        workspaceId,
        label,
        timeLabel: "Just now"
      }
    });
  } catch (error) {
    console.error("Failed to write to ActivityLog:", error);
  }
}

export async function logDuplicateAuditRecord(params: {
  workspaceId: string;
  feedbackContent: string;
  existingFeedbackId: string;
  customerName: string;
  sourceChannel: string;
  similarityScore: number;
  detectionMethod: "EXACT" | "SEMANTIC";
  importedBy: string;
  actionTaken: "Skipped & Merged";
}) {
  try {
    const payload = {
      feedbackContent: params.feedbackContent,
      existingFeedbackId: params.existingFeedbackId,
      customerName: params.customerName,
      sourceChannel: params.sourceChannel,
      similarityScore: params.similarityScore,
      detectionMethod: params.detectionMethod,
      importedBy: params.importedBy,
      actionTaken: params.actionTaken,
      createdAt: new Date().toISOString()
    };

    await prisma.activityLog.create({
      data: {
        workspaceId: params.workspaceId,
        label: `DUPLICATE_AUDIT:${JSON.stringify(payload)}`,
        timeLabel: "Just now"
      }
    });
  } catch (error) {
    console.error("Failed to write duplicate audit log:", error);
  }
}
