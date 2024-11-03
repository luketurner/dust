/*
  Warnings:

  - You are about to drop the column `selectedAIProfileId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `AIProfile` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AIProfile" DROP CONSTRAINT "AIProfile_userId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "selectedAIProfileId",
ADD COLUMN     "aiConfig" JSONB;

-- DropTable
DROP TABLE "AIProfile";
