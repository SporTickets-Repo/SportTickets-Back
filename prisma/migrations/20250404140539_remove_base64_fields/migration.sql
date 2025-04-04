/*
  Warnings:

  - You are about to drop the column `codeBase64` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `pixQRCodeBase64` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Ticket_codeBase64_key";

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "codeBase64";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "pixQRCodeBase64";
