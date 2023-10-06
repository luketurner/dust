-- CreateTable
CREATE TABLE "GitExportAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "configId" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),

    CONSTRAINT "GitExportAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GitExportAttempt_userId_startedAt_idx" ON "GitExportAttempt"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "GitExportAttempt_configId_startedAt_idx" ON "GitExportAttempt"("configId", "startedAt");

-- AddForeignKey
ALTER TABLE "GitExportAttempt" ADD CONSTRAINT "GitExportAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitExportAttempt" ADD CONSTRAINT "GitExportAttempt_configId_fkey" FOREIGN KEY ("configId") REFERENCES "GitExportConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;
