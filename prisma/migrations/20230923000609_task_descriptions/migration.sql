/*
  Warnings:

  - You are about to drop the column `description` on the `Tag` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Tag" DROP COLUMN "description";

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "description" TEXT NOT NULL DEFAULT '';
