-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "teamId" UUID;

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
