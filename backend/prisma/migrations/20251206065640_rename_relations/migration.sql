/*
  Warnings:

  - You are about to drop the `_DeveloperSkills` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TaskSkills` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_DeveloperSkills" DROP CONSTRAINT "_DeveloperSkills_A_fkey";

-- DropForeignKey
ALTER TABLE "_DeveloperSkills" DROP CONSTRAINT "_DeveloperSkills_B_fkey";

-- DropForeignKey
ALTER TABLE "_TaskSkills" DROP CONSTRAINT "_TaskSkills_A_fkey";

-- DropForeignKey
ALTER TABLE "_TaskSkills" DROP CONSTRAINT "_TaskSkills_B_fkey";

-- DropTable
DROP TABLE "_DeveloperSkills";

-- DropTable
DROP TABLE "_TaskSkills";

-- CreateTable
CREATE TABLE "_developer_skills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_developer_skills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_task_skills" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_task_skills_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_developer_skills_B_index" ON "_developer_skills"("B");

-- CreateIndex
CREATE INDEX "_task_skills_B_index" ON "_task_skills"("B");

-- AddForeignKey
ALTER TABLE "_developer_skills" ADD CONSTRAINT "_developer_skills_A_fkey" FOREIGN KEY ("A") REFERENCES "developers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_developer_skills" ADD CONSTRAINT "_developer_skills_B_fkey" FOREIGN KEY ("B") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_task_skills" ADD CONSTRAINT "_task_skills_A_fkey" FOREIGN KEY ("A") REFERENCES "skills"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_task_skills" ADD CONSTRAINT "_task_skills_B_fkey" FOREIGN KEY ("B") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
