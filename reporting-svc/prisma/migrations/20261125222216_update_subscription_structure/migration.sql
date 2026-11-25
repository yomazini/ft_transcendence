/*
  Warnings:

  - You are about to drop the column `cancel_at_period_end` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `created_at` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `ends_at` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `org_id` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `started_at` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `updated_at` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `Organization` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[organizationId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `Subscription` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `endDate` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripePriceId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `stripeSubscriptionId` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_org_id_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_subscription_id_fkey";

-- DropForeignKey
ALTER TABLE "Subscription" DROP CONSTRAINT "Subscription_org_id_fkey";

-- DropIndex
DROP INDEX "Subscription_ends_at_idx";

-- DropIndex
DROP INDEX "Subscription_org_id_status_idx";

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "stripeCustomerId" TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "cancel_at_period_end",
DROP COLUMN "created_at",
DROP COLUMN "ends_at",
DROP COLUMN "org_id",
DROP COLUMN "started_at",
DROP COLUMN "updated_at",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "endDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "organizationId" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "stripePriceId" TEXT NOT NULL,
ADD COLUMN     "stripeSubscriptionId" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL;

-- DropTable
DROP TABLE "Payment";

-- DropEnum
DROP TYPE "PriceSensitivity";

-- CreateIndex
CREATE UNIQUE INDEX "Organization_stripeCustomerId_key" ON "Organization"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_organizationId_key" ON "Subscription"("organizationId");

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_stripeSubscriptionId_key" ON "Subscription"("stripeSubscriptionId");

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
