/*
  Warnings:

  - Added the required column `created` to the `Comments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Comments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Comments" ADD COLUMN     "created" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;
