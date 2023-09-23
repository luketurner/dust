/*
  Warnings:

  - A unique constraint covering the columns `[userId,name]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[subjectId,type,objectId]` on the table `TaskRelation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Tag" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '';

-- CreateIndex
CREATE UNIQUE INDEX "Tag_userId_name_key" ON "Tag"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "TaskRelation_subjectId_type_objectId_key" ON "TaskRelation"("subjectId", "type", "objectId");
