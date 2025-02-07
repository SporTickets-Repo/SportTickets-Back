/*
  Warnings:

  - You are about to drop the column `companyId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `partnerId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to drop the column `companyId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `events` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `Company` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Event` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MASTER', 'ADMIN', 'PARTNER', 'USER');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_companyId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_partnerId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_companyId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "companyId",
ADD COLUMN     "userId" UUID NOT NULL;

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "partnerId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "companyId",
DROP COLUMN "events",
ADD COLUMN     "fantasyName" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "siteUrl" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';

-- DropTable
DROP TABLE "Company";

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
