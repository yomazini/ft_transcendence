-- CreateTable
CREATE TABLE "SubJob" (
    "id" TEXT NOT NULL,
    "job_id" TEXT NOT NULL,
    "nex_id" TEXT,
    "status" "JobStatuses" NOT NULL DEFAULT 'Running',
    "url" TEXT NOT NULL,
    "data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SubJob_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SubJob" ADD CONSTRAINT "SubJob_job_id_fkey" FOREIGN KEY ("job_id") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;
