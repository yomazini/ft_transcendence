-- DropForeignKey
ALTER TABLE "Comments" DROP CONSTRAINT "Comments_job_id_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_created_by_fkey";

-- DropForeignKey
ALTER TABLE "Job" DROP CONSTRAINT "Job_org_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_org_id_fkey";

-- DropForeignKey
ALTER TABLE "Messages" DROP CONSTRAINT "Messages_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Report" DROP CONSTRAINT "Report_job_id_fkey";

-- DropForeignKey
ALTER TABLE "role_and_organization" DROP CONSTRAINT "role_and_organization_org_id_fkey";

-- DropForeignKey
ALTER TABLE "role_and_organization" DROP CONSTRAINT "role_and_organization_user_id_fkey";

-- AlterTable
ALTER TABLE "Job" ALTER COLUMN "created_by" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "role_and_organization" ADD CONSTRAINT "role_and_organization_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "role_and_organization" ADD CONSTRAINT "role_and_organization_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comments" ADD CONSTRAINT "Comments_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Messages" ADD CONSTRAINT "Messages_org_id_fkey" FOREIGN KEY ("org_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
