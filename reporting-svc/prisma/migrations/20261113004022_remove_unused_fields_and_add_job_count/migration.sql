/*
  Warnings:

  - You are about to drop the column `created_by` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Job` table. All the data in the column will be lost.
  - You are about to drop the column `nex_id` on the `SubJob` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `SubJob` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[next_id]` on the table `SubJob` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Job` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_created_by_fkey";

-- DropIndex
DROP INDEX "SubJob_nex_id_key";

-- AlterTable
ALTER TABLE "Job" DROP COLUMN "created_by",
DROP COLUMN "updated_at",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "counter" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "SubJob" DROP COLUMN "nex_id",
DROP COLUMN "status",
ADD COLUMN     "next_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SubJob_next_id_key" ON "SubJob"("next_id");
