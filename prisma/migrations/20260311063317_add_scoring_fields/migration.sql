-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "ageScore" INTEGER DEFAULT 0,
ADD COLUMN     "educationScore" INTEGER DEFAULT 0,
ADD COLUMN     "experienceScore" INTEGER DEFAULT 0,
ADD COLUMN     "genderScore" INTEGER DEFAULT 0,
ADD COLUMN     "religionScore" INTEGER DEFAULT 0,
ADD COLUMN     "salaryScore" INTEGER DEFAULT 0,
ADD COLUMN     "scoredAt" TIMESTAMP(3),
ADD COLUMN     "totalScore" INTEGER DEFAULT 0;
