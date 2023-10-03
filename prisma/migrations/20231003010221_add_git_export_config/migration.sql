-- CreateTable
CREATE TABLE "GitExportConfig" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sshPrivateKey" TEXT,
    "sshPublicKey" TEXT,
    "remoteUrl" TEXT,

    CONSTRAINT "GitExportConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GitExportConfig_userId_idx" ON "GitExportConfig"("userId");

-- AddForeignKey
ALTER TABLE "Agenda" ADD CONSTRAINT "Agenda_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GitExportConfig" ADD CONSTRAINT "GitExportConfig_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
