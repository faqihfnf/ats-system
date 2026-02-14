-- CreateTable
CREATE TABLE "divisi" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "divisi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "positions" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "divisiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "positions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "divisi_nama_key" ON "divisi"("nama");

-- AddForeignKey
ALTER TABLE "positions" ADD CONSTRAINT "positions_divisiId_fkey" FOREIGN KEY ("divisiId") REFERENCES "divisi"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
