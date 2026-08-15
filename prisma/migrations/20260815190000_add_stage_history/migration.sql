-- CreateTable
CREATE TABLE "stage_histories" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "fromStageId" TEXT,
    "toStageId" TEXT NOT NULL,
    "changedById" TEXT NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stage_histories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "stage_histories_applicationId_createdAt_idx" ON "stage_histories"("applicationId", "createdAt");

-- AddForeignKey
ALTER TABLE "stage_histories" ADD CONSTRAINT "stage_histories_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_histories" ADD CONSTRAINT "stage_histories_fromStageId_fkey" FOREIGN KEY ("fromStageId") REFERENCES "stages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_histories" ADD CONSTRAINT "stage_histories_toStageId_fkey" FOREIGN KEY ("toStageId") REFERENCES "stages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stage_histories" ADD CONSTRAINT "stage_histories_changedById_fkey" FOREIGN KEY ("changedById") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;