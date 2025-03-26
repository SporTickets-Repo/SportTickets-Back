/*
  Warnings:

  - You are about to drop the column `restriction` on the `TicketType` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "restriction" "Restriction" NOT NULL DEFAULT 'SAME_CATEGORY';

-- AlterTable
ALTER TABLE "TicketType" DROP COLUMN "restriction";
