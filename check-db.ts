import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const imports = await prisma.import.findMany();
  console.log("Imports:", imports);

  const feedbacks = await prisma.feedback.findMany({
    select: { id: true, createdAt: true, importId: true, importedAt: true },
    take: 5
  });
  console.log("Sample Feedbacks:", feedbacks);

  const feedbacksWithoutImportId = await prisma.feedback.count({
    where: { importId: null }
  });
  console.log("Feedbacks without importId:", feedbacksWithoutImportId);
}

main().catch(console.error).finally(() => prisma.$disconnect());
