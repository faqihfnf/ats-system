-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "aiConclusion" TEXT,
ADD COLUMN     "aiMatchPercentage" INTEGER,
ADD COLUMN     "aiRecommendation" TEXT,
ADD COLUMN     "aiStrengths" TEXT,
ADD COLUMN     "aiWeaknesses" TEXT,
ADD COLUMN     "analyzedAt" TIMESTAMP(3);
