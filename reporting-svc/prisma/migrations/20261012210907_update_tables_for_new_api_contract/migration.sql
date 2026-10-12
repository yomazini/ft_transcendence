/*
  Warnings:

  - You are about to alter the column `description` on the `Organization` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(200)`.
  - A unique constraint covering the columns `[user_id,org_id]` on the table `role_and_organization` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Comments" ALTER COLUMN "author" DROP NOT NULL,
ALTER COLUMN "sentiment_score" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "customer_persona" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Organization" ALTER COLUMN "description" SET DATA TYPE VARCHAR(200);

-- AlterTable
ALTER TABLE "Report" ALTER COLUMN "conclusion" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "email_verified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "is_2fa_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "two_factor_secret" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "role_and_organization_user_id_org_id_key" ON "role_and_organization"("user_id", "org_id");
