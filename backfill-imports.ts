import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log("Starting backfill for legacy feedback records...");
  
  // Find all feedbacks missing an importId
  const feedbacksToUpdate = await prisma.feedback.findMany({
    where: { importId: null },
    select: { id: true, importedAt: true, workspaceId: true }
  });

  if (feedbacksToUpdate.length === 0) {
    console.log("No feedback records need backfilling.");
    return;
  }

  console.log(`Found ${feedbacksToUpdate.length} feedbacks missing importId.`);

  // To be safe, let's get all imports to map them
  const imports = await prisma.import.findMany({
    orderBy: { createdAt: 'desc' }
  });

  let updatedCount = 0;

  for (const feedback of feedbacksToUpdate) {
    // Find an import in the same workspace that happened before or near the feedback's importedAt
    // If not found, just use the oldest or most recent import in that workspace.
    let bestImport = imports.find(i => i.workspaceId === feedback.workspaceId && i.createdAt <= feedback.importedAt);
    
    if (!bestImport) {
      bestImport = imports.find(i => i.workspaceId === feedback.workspaceId);
    }

    if (bestImport) {
      await prisma.feedback.update({
        where: { id: feedback.id },
        data: { importId: bestImport.id }
      });
      updatedCount++;
    }
  }

  console.log(`Successfully backfilled ${updatedCount} records.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
