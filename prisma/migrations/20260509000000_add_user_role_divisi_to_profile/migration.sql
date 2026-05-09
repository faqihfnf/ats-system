-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'USER';

-- AlterTable
ALTER TABLE "profiles"
ADD COLUMN "divisiId" TEXT;

-- CreateIndex
CREATE INDEX "profiles_divisiId_idx" ON "profiles"("divisiId");

-- AddForeignKey
ALTER TABLE "profiles"
ADD CONSTRAINT "profiles_divisiId_fkey"
FOREIGN KEY ("divisiId") REFERENCES "divisi"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
