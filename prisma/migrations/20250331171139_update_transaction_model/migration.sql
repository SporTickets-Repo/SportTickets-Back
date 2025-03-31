/*
  Warnings:

  - Added the required column `createdBy` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'PAYPAL', 'MERCADOPAGO');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "createdBy" UUID NOT NULL,
ADD COLUMN     "externalPaymentId" TEXT,
ADD COLUMN     "externalStatus" TEXT,
ADD COLUMN     "paidAt" TIMESTAMP(3),
ADD COLUMN     "paymentMethod" TEXT,
ADD COLUMN     "paymentProvider" "PaymentProvider",
ADD COLUMN     "pixQRCode" TEXT,
ADD COLUMN     "pixQRCodeBase64" TEXT,
ADD COLUMN     "response" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
