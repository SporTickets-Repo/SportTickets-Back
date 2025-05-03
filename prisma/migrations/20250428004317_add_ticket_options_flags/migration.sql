-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "allowFullTickets" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "allowIndividualTickets" BOOLEAN NOT NULL DEFAULT false;
