-- CreateTable
CREATE TABLE "Term" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "isObligatory" BOOLEAN NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Term_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TermTicketConfirmation" (
    "id" UUID NOT NULL,
    "termId" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "confirmedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TermTicketConfirmation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TermTicketConfirmation_termId_ticketId_key" ON "TermTicketConfirmation"("termId", "ticketId");

-- AddForeignKey
ALTER TABLE "Term" ADD CONSTRAINT "Term_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermTicketConfirmation" ADD CONSTRAINT "TermTicketConfirmation_termId_fkey" FOREIGN KEY ("termId") REFERENCES "Term"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TermTicketConfirmation" ADD CONSTRAINT "TermTicketConfirmation_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
