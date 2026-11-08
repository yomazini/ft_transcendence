-- DropIndex
DROP INDEX "Comments_reddit_id_key";

-- DropIndex
DROP INDEX "Report_job_id_key";

-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Report" ADD COLUMN     "sentiment_score" DOUBLE PRECISION;
