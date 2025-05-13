/*
  Warnings:

  - You are about to alter the column `percentage` on the `Coupon` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `eventFee` on the `Event` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `Ticket` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `price` on the `TicketLot` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.
  - You are about to alter the column `totalValue` on the `Transaction` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `Decimal(10,2)`.

*/
-- AlterTable
ALTER TABLE "Coupon" ALTER COLUMN "percentage" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "eventFee" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "TicketLot" ALTER COLUMN "price" SET DATA TYPE DECIMAL(10,2);

-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "totalValue" SET DATA TYPE DECIMAL(10,2);
