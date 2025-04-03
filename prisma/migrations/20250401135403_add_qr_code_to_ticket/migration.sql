/*
  Warnings:

  - A unique constraint covering the columns `[codeBase64]` on the table `Ticket` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Ticket" ADD COLUMN     "codeBase64" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_codeBase64_key" ON "Ticket"("codeBase64");
