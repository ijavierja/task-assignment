/*
  Warnings:

  - You are about to drop the `developer_skills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `task_skills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "developer_skills" DROP CONSTRAINT "developer_skills_developerId_fkey";

-- DropForeignKey
ALTER TABLE "developer_skills" DROP CONSTRAINT "developer_skills_skillId_fkey";

-- DropForeignKey
ALTER TABLE "task_skills" DROP CONSTRAINT "task_skills_skillId_fkey";

-- DropForeignKey
ALTER TABLE "task_skills" DROP CONSTRAINT "task_skills_taskId_fkey";

-- DropTable
DROP TABLE "developer_skills";

-- DropTable
DROP TABLE "task_skills";

-- CreateTable
CREATE TABLE "_DeveloperSkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_DeveloperSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_TaskSkills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TaskSkills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_DeveloperSkills_B_index" ON "_DeveloperSkills"("B");

-- CreateIndex
CREATE INDEX "_TaskSkills_B_index" ON "_TaskSkills"("B");

-- AddForeignKey
ALTER TABLE "_DeveloperSkills" ADD CONSTRAINT "_DeveloperSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_DeveloperSkills" ADD CONSTRAINT "_DeveloperSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskSkills" ADD CONSTRAINT "_TaskSkills_A_fkey" FOREIGN KEY ("A") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TaskSkills" ADD CONSTRAINT "_TaskSkills_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
