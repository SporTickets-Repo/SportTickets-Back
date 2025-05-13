/*
  Warnings:

  - You are about to drop the column `EmailCustomText` on the `Event` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Event" DROP COLUMN "EmailCustomText",
ADD COLUMN     "emailCustomText" TEXT;
