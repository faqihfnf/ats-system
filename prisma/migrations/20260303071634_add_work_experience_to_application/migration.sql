-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "jobEndYear" TEXT,
ADD COLUMN     "jobStartYear" INTEGER,
ADD COLUMN     "lastCompany" TEXT,
ADD COLUMN     "lastJobTitle" TEXT,
ADD COLUMN     "stillWorking" BOOLEAN NOT NULL DEFAULT false;
