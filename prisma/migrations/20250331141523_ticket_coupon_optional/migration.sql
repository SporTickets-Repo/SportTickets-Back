-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_couponId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "couponId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;
