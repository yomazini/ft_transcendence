/*
  Warnings:

  - A unique constraint covering the columns `[org_id]` on the table `ApiKey` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_org_id_key" ON "ApiKey"("org_id");
