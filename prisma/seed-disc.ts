import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma";
import { DISC_QUESTIONS } from "../src/lib/disc/questions";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding DISC questions...");

  for (const q of DISC_QUESTIONS) {
    await prisma.discQuestion.upsert({
      where: { groupNo: q.groupNo },
      update: {
        wordD: q.wordD,
        wordI: q.wordI,
        wordS: q.wordS,
        wordC: q.wordC,
      },
      create: {
        groupNo: q.groupNo,
        wordD: q.wordD,
        wordI: q.wordI,
        wordS: q.wordS,
        wordC: q.wordC,
        isActive: true,
      },
    });
  }

  console.log(`✅ Seeded ${DISC_QUESTIONS.length} DISC questions`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
