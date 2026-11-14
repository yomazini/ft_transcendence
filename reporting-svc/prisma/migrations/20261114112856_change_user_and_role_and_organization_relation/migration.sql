/*
  Warnings:

  - A unique constraint covering the columns `[user_id]` on the table `role_and_organization` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "role_and_organization_user_id_key" ON "role_and_organization"("user_id");
