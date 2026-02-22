-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('ACTIVE', 'HIRED', 'REJECTED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "applications" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "birthPlace" TEXT NOT NULL,
    "birthDate" TIMESTAMP(3) NOT NULL,
    "religion" "Religion" NOT NULL,
    "ktpAddress" TEXT NOT NULL,
    "domicileAddress" TEXT NOT NULL,
    "sameAsKtp" BOOLEAN NOT NULL DEFAULT false,
    "province" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "subdistrict" TEXT NOT NULL,
    "educationId" TEXT NOT NULL,
    "institution" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" TEXT NOT NULL,
    "currentSalary" INTEGER,
    "expectedSalary" INTEGER NOT NULL,
    "cvUrl" TEXT,
    "currentStageId" TEXT,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_answers" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_answers_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_educationId_fkey" FOREIGN KEY ("educationId") REFERENCES "educations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_currentStageId_fkey" FOREIGN KEY ("currentStageId") REFERENCES "stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_answers" ADD CONSTRAINT "application_answers_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_answers" ADD CONSTRAINT "application_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "custom_questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
