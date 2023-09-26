-- CreateTable
CREATE TABLE "Day" (
    "date" DATE NOT NULL,
    "quoteId" TEXT NOT NULL,

    CONSTRAINT "Day_pkey" PRIMARY KEY ("date")
);

-- CreateTable
CREATE TABLE "Quote" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "source" TEXT,
    "lastQuotedOn" DATE,

    CONSTRAINT "Quote_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Day" ADD CONSTRAINT "Day_quoteId_fkey" FOREIGN KEY ("quoteId") REFERENCES "Quote"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
