/*
  Warnings:

  - You are about to drop the column `archived` on the `AgendaTask` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AgendaTask" DROP COLUMN "archived",
ADD COLUMN     "deferred" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "important" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "urgent" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ProjectToTask" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Project_userId_name_key" ON "Project"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToTask_AB_unique" ON "_ProjectToTask"("A", "B");

-- CreateIndex
CREATE INDEX "_ProjectToTask_B_index" ON "_ProjectToTask"("B");

-- AddForeignKey
ALTER TABLE "_ProjectToTask" ADD CONSTRAINT "_ProjectToTask_A_fkey" FOREIGN KEY ("A") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProjectToTask" ADD CONSTRAINT "_ProjectToTask_B_fkey" FOREIGN KEY ("B") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
