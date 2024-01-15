-- AlterTable
ALTER TABLE "Agenda" ADD COLUMN     "rawCompletion" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "useAI" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "TaskEmbedding" (
    "taskId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "vector" DOUBLE PRECISION[]
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskEmbedding_taskId_version_key" ON "TaskEmbedding"("taskId", "version");

-- AddForeignKey
ALTER TABLE "TaskEmbedding" ADD CONSTRAINT "TaskEmbedding_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
