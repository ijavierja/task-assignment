/*
  Warnings:

  - You are about to drop the column `developerId` on the `tasks` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "tasks" DROP CONSTRAINT "tasks_developerId_fkey";

-- DropIndex
DROP INDEX "tasks_developerId_idx";

-- AlterTable
ALTER TABLE "tasks" DROP COLUMN "developerId",
ADD COLUMN     "assigneeId" TEXT;

-- CreateIndex
CREATE INDEX "tasks_assigneeId_idx" ON "tasks"("assigneeId");

-- AddForeignKey
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "developers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
