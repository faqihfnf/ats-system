/*
  Warnings:

  - Added the required column `levelId` to the `positions` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "positions" ADD COLUMN     "levelId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "level" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "level_nama_key" ON "level"("nama");

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_levelId_fkey" FOREIGN KEY ("levelId") REFERENCES "level"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
