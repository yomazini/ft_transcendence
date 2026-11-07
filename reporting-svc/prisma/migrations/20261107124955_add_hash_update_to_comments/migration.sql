/*
  Warnings:

  - You are about to drop the column `created` on the `Comments` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Comments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[reddit_id]` on the table `Comments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `hash` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reddit_id` to the `Comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comments" DROP COLUMN "created",
DROP COLUMN "name",
ADD COLUMN     "hash" VARCHAR(64) NOT NULL,
ADD COLUMN     "reddit_id" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "Comments_reddit_id_key" ON "Comments"("reddit_id");
