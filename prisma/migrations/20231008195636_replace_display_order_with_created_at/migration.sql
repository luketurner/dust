/*
  Warnings:

  - You are about to drop the column `displayOrder` on the `Task` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[userId,createdAt]` on the table `Task` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdAt` to the `Task` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Task_userId_displayOrder_key";

-- AlterTable
ALTER TABLE "Task" DROP COLUMN "displayOrder",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Task_userId_createdAt_key" ON "Task"("userId", "createdAt");
