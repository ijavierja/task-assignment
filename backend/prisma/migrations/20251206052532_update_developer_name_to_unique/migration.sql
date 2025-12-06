/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `developers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "developers_name_key" ON "developers"("name");
