/*
  Warnings:

  - Added the required column `maxAge` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minAge` to the `jobs` table without a default value. This is not possible if the table is not empty.
  - Made the column `minEducationId` on table `jobs` required. This step will fail if there are existing NULL values in that column.
  - Made the column `minExperienceId` on table `jobs` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'ANY');

-- CreateEnum
CREATE TYPE "Religion" AS ENUM ('ISLAM', 'KRISTEN', 'KATOLIK', 'HINDU', 'BUDDHA', 'KONGHUCU', 'ANY');

-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_minEducationId_fkey";

-- DropForeignKey
ALTER TABLE "jobs" DROP CONSTRAINT "jobs_minExperienceId_fkey";

-- AlterTable
ALTER TABLE "jobs" ADD COLUMN     "gender" "Gender" NOT NULL DEFAULT 'ANY',
ADD COLUMN     "maxAge" INTEGER NOT NULL,
ADD COLUMN     "minAge" INTEGER NOT NULL,
ADD COLUMN     "religion" "Religion" NOT NULL DEFAULT 'ANY',
ADD COLUMN     "showAge" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showGender" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "showReligion" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "minEducationId" SET NOT NULL,
ALTER COLUMN "minExperienceId" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_minEducationId_fkey" FOREIGN KEY ("minEducationId") REFERENCES "educations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "jobs" ADD CONSTRAINT "jobs_minExperienceId_fkey" FOREIGN KEY ("minExperienceId") REFERENCES "experiences"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
