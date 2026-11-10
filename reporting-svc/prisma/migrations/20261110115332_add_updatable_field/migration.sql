/*
  Warnings:

  - A unique constraint covering the columns `[nex_id]` on the table `SubJob` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "updatable" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "status" SET DEFAULT 'Queued';

-- CreateIndex
CREATE UNIQUE INDEX "SubJob_nex_id_key" ON "SubJob"("nex_id");
