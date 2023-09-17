-- CreateTable
CREATE TABLE "Agenda" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,

    CONSTRAINT "Agenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgendaTask" (
    "agendaId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL,

    CONSTRAINT "AgendaTask_pkey" PRIMARY KEY ("agendaId","taskId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agenda_userId_date_key" ON "Agenda"("userId", "date");

-- AddForeignKey
ALTER TABLE "AgendaTask" ADD CONSTRAINT "AgendaTask_agendaId_fkey" FOREIGN KEY ("agendaId") REFERENCES "Agenda"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgendaTask" ADD CONSTRAINT "AgendaTask_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
