/*
  Warnings:

  - You are about to drop the column `nome` on the `Bracket` table. All the data in the column will be lost.
  - You are about to alter the column `percentage` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to drop the column `bracketId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `ticketTypeId` on the `Ticket` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Ticket` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - You are about to alter the column `price` on the `TicketLot` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The `restriction` column on the `TicketType` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `userType` column on the `TicketType` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `mode` column on the `TicketType` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `status` column on the `Transaction` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `totalValue` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `Decimal(65,30)`.
  - The `documentType` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the `PersonalizedFields` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `eventId` to the `Bracket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Bracket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Coupon` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ticketLotId` to the `Ticket` table without a default value. This is not possible if the table is not empty.
  - Made the column `couponId` on table `Ticket` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PROGRESS', 'CANCELLED', 'FINISHED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "Restriction" AS ENUM ('NONE', 'SAME_CATEGORY');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ATHLETE', 'VIEWER');

-- CreateEnum
CREATE TYPE "Mode" AS ENUM ('INDIVUAL', 'DUO');

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_bracketId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_userId_fkey";

-- DropForeignKey
ALTER TABLE "PersonalizedFields" DROP CONSTRAINT "PersonalizedFields_ticketTypeId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_couponId_fkey";

-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_ticketTypeId_fkey";

-- AlterTable
ALTER TABLE "Bracket" DROP COLUMN "nome",
ADD COLUMN     "eventId" UUID NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "createdBy" UUID NOT NULL,
ALTER COLUMN "percentage" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "bracketId",
DROP COLUMN "slug",
DROP COLUMN "userId",
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'DRAFT';

-- AlterTable
ALTER TABLE "Ticket" DROP COLUMN "ticketTypeId",
ADD COLUMN     "categoryId" UUID NOT NULL,
ADD COLUMN     "ticketLotId" UUID NOT NULL,
ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30),
ALTER COLUMN "couponId" SET NOT NULL;

-- AlterTable
ALTER TABLE "TicketLot" ALTER COLUMN "price" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "TicketType" DROP COLUMN "restriction",
ADD COLUMN     "restriction" "Restriction" NOT NULL DEFAULT 'SAME_CATEGORY',
DROP COLUMN "userType",
ADD COLUMN     "userType" "UserType" NOT NULL DEFAULT 'ATHLETE',
DROP COLUMN "mode",
ADD COLUMN     "mode" "Mode" NOT NULL DEFAULT 'DUO';

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "status",
ADD COLUMN     "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
ALTER COLUMN "totalValue" SET DATA TYPE DECIMAL(65,30);

-- AlterTable
ALTER TABLE "User" DROP COLUMN "documentType",
ADD COLUMN     "documentType" "DocumentType" NOT NULL DEFAULT 'CPF',
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "cep" DROP NOT NULL;

-- DropTable
DROP TABLE "PersonalizedFields";

-- CreateTable
CREATE TABLE "PersonalizedField" (
    "id" UUID NOT NULL,
    "ticketTypeId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "requestTitle" TEXT NOT NULL,
    "optionsList" JSONB,

    CONSTRAINT "PersonalizedField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizedFieldAnswer" (
    "id" UUID NOT NULL,
    "personalizedFieldId" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "PersonalizedFieldAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDashboardAccess" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "eventId" UUID NOT NULL,

    CONSTRAINT "EventDashboardAccess_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketLotId_fkey" FOREIGN KEY ("ticketLotId") REFERENCES "TicketLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bracket" ADD CONSTRAINT "Bracket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedField" ADD CONSTRAINT "PersonalizedField_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedFieldAnswer" ADD CONSTRAINT "PersonalizedFieldAnswer_personalizedFieldId_fkey" FOREIGN KEY ("personalizedFieldId") REFERENCES "PersonalizedField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedFieldAnswer" ADD CONSTRAINT "PersonalizedFieldAnswer_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDashboardAccess" ADD CONSTRAINT "EventDashboardAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDashboardAccess" ADD CONSTRAINT "EventDashboardAccess_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
