/*
  Warnings:

  - You are about to drop the column `completedAt` on the `Task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,displayOrder]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `archived` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `completed` to the `Task` table without a default value. This is not possible if the table is not empty.
  - Added the required column `displayOrder` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Task" DROP COLUMN "completedAt",
ADD COLUMN     "archived" BOOLEAN NOT NULL,
ADD COLUMN     "completed" BOOLEAN NOT NULL,
ADD COLUMN     "displayOrder" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Task_userId_displayOrder_key" ON "Task"("userId", "displayOrder");
