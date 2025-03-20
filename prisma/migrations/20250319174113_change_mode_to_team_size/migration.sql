/*
  Warnings:

  - You are about to drop the column `mode` on the `TicketType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TicketType" DROP COLUMN "mode",
ADD COLUMN     "teamSize" INTEGER NOT NULL DEFAULT 1;

-- DropEnum
DROP TYPE "Mode";
