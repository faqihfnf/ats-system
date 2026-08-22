-- CreateEnum
CREATE TYPE "ApplicantSourceCategory" AS ENUM ('CAREER_SITE', 'JOB_PORTAL', 'SOCIAL_MEDIA', 'REFERRAL', 'OTHER');

-- CreateTable: applicant_sources
CREATE TABLE "applicant_sources" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" "ApplicantSourceCategory" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applicant_sources_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "applicant_sources_code_key" ON "applicant_sources"("code");
CREATE UNIQUE INDEX "applicant_sources_name_key" ON "applicant_sources"("name");

-- CreateTable: applicant_imports
CREATE TABLE "applicant_imports" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "importedById" TEXT NOT NULL,
    "excelFileName" TEXT NOT NULL,
    "zipFileName" TEXT NOT NULL,
    "totalApplicants" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "applicant_imports_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "applicant_imports" ADD CONSTRAINT "applicant_imports_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "applicant_imports" ADD CONSTRAINT "applicant_imports_importedById_fkey" FOREIGN KEY ("importedById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AlterTable: applications
ALTER TABLE "applications" ADD COLUMN "externalApplicantId" TEXT;
ALTER TABLE "applications" ADD COLUMN "importId" TEXT;
ALTER TABLE "applications" ADD COLUMN "originalCvFileName" TEXT;
ALTER TABLE "applications" ADD COLUMN "sourceId" TEXT;

-- Backfill existing applications
UPDATE "applications" SET "sourceId" = 'src_career_web' WHERE "sourceId" IS NULL;

-- Set NOT NULL
ALTER TABLE "applications" ALTER COLUMN "sourceId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "applications_sourceId_idx" ON "applications"("sourceId");
CREATE INDEX "applications_jobId_externalApplicantId_idx" ON "applications"("jobId", "externalApplicantId");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "applicant_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "applications" ADD CONSTRAINT "applications_importId_fkey" FOREIGN KEY ("importId") REFERENCES "applicant_imports"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Seed default sources
INSERT INTO "applicant_sources" ("id", "code", "name", "category", "isActive", "createdAt", "updatedAt")
VALUES
  ('src_career_web', 'CAREER_WEB', 'Karir Web', 'CAREER_SITE', true, NOW(), NOW()),
  ('src_facebook', 'FACEBOOK', 'Facebook', 'SOCIAL_MEDIA', true, NOW(), NOW()),
  ('src_linkedin', 'LINKEDIN', 'LinkedIn', 'JOB_PORTAL', true, NOW(), NOW()),
  ('src_jobstreet', 'JOBSTREET', 'JobStreet', 'JOB_PORTAL', true, NOW(), NOW()),
  ('src_glints', 'GLINTS', 'Glints', 'JOB_PORTAL', true, NOW(), NOW()),
  ('src_kalibrr', 'KALIBRR', 'Kalibrr', 'JOB_PORTAL', true, NOW(), NOW()),
  ('src_other_job_portal', 'OTHER_JOB_PORTAL', 'Job Portal Lainnya', 'JOB_PORTAL', true, NOW(), NOW()),
  ('src_referral', 'REFERRAL', 'Employee Referral', 'REFERRAL', true, NOW(), NOW()),
  ('src_other', 'OTHER', 'Lainnya', 'OTHER', true, NOW(), NOW())
ON CONFLICT ("code") DO NOTHING;