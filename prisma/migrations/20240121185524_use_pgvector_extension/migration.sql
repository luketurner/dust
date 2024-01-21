/*
  Warnings:

  - Changed the type of `vector` on the `TaskEmbedding` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TaskEmbedding" DROP COLUMN "vector",
ADD COLUMN     "vector" vector NOT NULL;
