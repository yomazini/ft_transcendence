/*
  Warnings:

  - You are about to drop the `Jop` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[job_id]` on the table `Report` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_job_id_fkey";

-- DropForeignKey
ALTER TABLE "Jop" DROP CONSTRAINT "Jop_created_by_fkey";

-- DropForeignKey
ALTER TABLE "Jop" DROP CONSTRAINT "Jop_org_id_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_job_id_fkey";

-- DropTable
DROP TABLE "Jop";

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "org_id" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "mode" "JobModes" NOT NULL DEFAULT 'Keyword',
    "status" "JobStatuses" NOT NULL DEFAULT 'Running',
    "customer_persona" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Report_job_id_key" ON "Report"("job_id");

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
