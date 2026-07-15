import { PrismaClient, Role, ReportStatus } from "@prisma/client";
import { hashPassword } from "../lib/password";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

// Helper to generate a random 1536-dimensional float vector
function generateMockVector(): number[] {
  return Array.from({ length: 1536 }, () => (Math.random() - 0.5) * 2);
}

// Helper to insert pgvector embeddings via raw SQL
async function seedEmbedding(feedbackId: string) {
  const id = `emb_${Math.random().toString(36).substr(2, 9)}`;
  const vector = generateMockVector();
  const vectorString = `[${vector.join(",")}]`;
  
  await prisma.$executeRawUnsafe(
    `INSERT INTO "Embedding" ("id", "feedbackId", "vector") VALUES ($1, $2, $3::vector) ON CONFLICT ("feedbackId") DO NOTHING;`,
    id,
    feedbackId,
    vectorString
  );
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

async function main() {
  console.log("🚀 Starting database seeding...");

  // 1. Enable pgvector extension
  console.log("🔧 Enabling pgvector extension...");
  await prisma.$executeRawUnsafe("CREATE EXTENSION IF NOT EXISTS vector;");

  // 2. Clear old feedback records in cascading order (only for default workspace to protect registered user data)
  console.log("🧹 Clearing old feedback records for default workspace...");
  const existingW = await prisma.workspace.findUnique({ where: { slug: "northstar-labs" } });
  if (existingW) {
    await prisma.feedback.deleteMany({ where: { workspaceId: existingW.id } }).catch(() => {});
    await prisma.theme.deleteMany({ where: { workspaceId: existingW.id } }).catch(() => {});
    await prisma.report.deleteMany({ where: { workspaceId: existingW.id } }).catch(() => {});
  }

  // 3. Find or Seed main workspace
  console.log("🏢 Resolving workspace...");
  let workspace = await prisma.workspace.findUnique({
    where: { slug: "northstar-labs" }
  });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "Northstar Labs",
        slug: "northstar-labs"
      }
    });
  }

  // 5. Seed Themes
  console.log("🏷️ Seeding default workspace themes...");
  const themesData = [
    { name: "Support Responsiveness", description: "How fast and helpful support feels to customers." },
    { name: "Performance & Load Speed", description: "Performance issues, latency, sluggish UI, and page crashes." },
    { name: "Billing & Pricing Plans", description: "Concerns about subscription tiers, seat limits, and invoice billing." },
    { name: "Integrations & API Sync", description: "Syncing issues with Slack, webhooks, or API authentication errors." },
    { name: "UI & General Usability", description: "Problems with menus, layouts, readability, and overall user experience." }
  ];

  const seededThemes = [];
  for (const t of themesData) {
    const theme = await prisma.theme.create({
      data: {
        workspaceId: workspace.id,
        name: t.name,
        description: t.description
      }
    });
    seededThemes.push(theme);
  }

  // 6. Seed Customer Feedback items from CSV file directly
  console.log("📝 Seeding high-fidelity customer feedback items from LOOP_Feedback_Themes_350.csv...");
  const csvPath = path.join(__dirname, "../LOOP_Feedback_Themes_350.csv");
  const csvData = fs.readFileSync(csvPath, "utf-8");
  const lines = csvData.split(/\r?\n/).filter(line => line.trim().length > 0);
  const dataLines = lines.slice(1); // skip headers

  const themeCache = new Map<string, any>();

  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    const columns = parseCSVLine(line);
    if (columns.length < 5) continue;

    const rawFeedback = columns[0];
    const channel = columns[1];
    const rawTheme = columns[2];
    const sentimentLabel = columns[3];
    const status = columns[4];

    // Parse customer name from comment if it has a colon
    let customerName = "Anonymous Customer";
    let content = rawFeedback;
    if (rawFeedback.includes(":")) {
      const colonIndex = rawFeedback.indexOf(":");
      customerName = rawFeedback.substring(0, colonIndex).trim();
      content = rawFeedback.substring(colonIndex + 1).trim();
    }
    const customerEmail = `${customerName.toLowerCase().replace(/\s+/g, ".")}@customer.com`;

    let sentimentScore = 0.0;
    if (sentimentLabel === "Positive") sentimentScore = 0.8;
    else if (sentimentLabel === "Negative") sentimentScore = -0.8;

    let intent = "Question";
    const lowercaseContent = content.toLowerCase();
    if (lowercaseContent.includes("bug") || lowercaseContent.includes("crash") || lowercaseContent.includes("error")) {
      intent = "Bug";
    } else if (lowercaseContent.includes("add") || lowercaseContent.includes("feature") || lowercaseContent.includes("integrate")) {
      intent = "Feature Request";
    } else if (lowercaseContent.includes("love") || lowercaseContent.includes("amazing") || lowercaseContent.includes("thanks")) {
      intent = "Praise";
    }

    const title = content.split(" ").slice(0, 5).join(" ") + "...";

    // Create or resolve Theme
    let themeRecord = themeCache.get(rawTheme);
    if (rawTheme && !themeRecord) {
      themeRecord = await prisma.theme.findFirst({
        where: { name: rawTheme, workspaceId: workspace.id }
      });
      if (!themeRecord) {
        themeRecord = await prisma.theme.create({
          data: {
            name: rawTheme,
            workspaceId: workspace.id,
            description: `Auto-generated category cluster for "${rawTheme}" feedback.`
          }
        });
      }
      themeCache.set(rawTheme, themeRecord);
    }

    // Create Feedback with actual source and status
    const feedback = await prisma.feedback.create({
      data: {
        workspaceId: workspace.id,
        title,
        content,
        sentiment: sentimentScore,
        sentimentLabel,
        intent,
        tags: intent !== "Question" ? [intent] : [],
        source: channel || "CSV",
        status: status || "New",
        customerName,
        customerEmail
      }
    });

    // Link Theme relation
    if (themeRecord) {
      await prisma.feedbackTheme.create({
        data: {
          feedbackId: feedback.id,
          themeId: themeRecord.id
        }
      });
    }

    // Seed vector embedding
    await seedEmbedding(feedback.id);
  }

  // 7. Seed one sample Report
  console.log("📊 Seeding sample VOC report...");
  await prisma.report.create({
    data: {
      workspaceId: workspace.id,
      title: "Q2 Core VOC Priorities Summary",
      summary: "High user interest in Dark Mode layout updates and team seat billing flexibility. Urgent API 504 timeouts mapped under performance.",
      status: ReportStatus.READY
    }
  });

  console.log("✅ Database seeding completed successfully!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error("❌ Seeding failed:", error);
    await prisma.$disconnect();
    process.exit(1);
  });
