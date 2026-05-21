-- CreateEnum
CREATE TYPE "EducationCategory" AS ENUM ('SCHOOL', 'UNIVERSITY');

-- AlterTable
ALTER TABLE "educations"
ADD COLUMN "category" "EducationCategory";

-- Backfill school categories based on common Indonesian school levels
UPDATE "educations"
SET "category" = 'SCHOOL'
WHERE lower(trim("name")) IN ('tk', 'paud', 'kb', 'ra', 'sd', 'smp', 'sma', 'smk', 'slb', 'mi', 'mts', 'ma')
   OR lower("name") LIKE 'tk %'
   OR lower("name") LIKE 'paud %'
   OR lower("name") LIKE 'kb %'
   OR lower("name") LIKE 'ra %'
   OR lower("name") LIKE 'sd %'
   OR lower("name") LIKE 'smp %'
   OR lower("name") LIKE 'sma %'
   OR lower("name") LIKE 'smk %'
   OR lower("name") LIKE 'slb %'
   OR lower("name") LIKE 'mi %'
   OR lower("name") LIKE 'mts %'
   OR lower("name") LIKE 'ma %'
   OR lower("name") LIKE '%sekolah%';

-- Default any remaining historical data to university
UPDATE "educations"
SET "category" = 'UNIVERSITY'
WHERE "category" IS NULL;

-- Enforce not null after backfill
ALTER TABLE "educations"
ALTER COLUMN "category" SET NOT NULL;
