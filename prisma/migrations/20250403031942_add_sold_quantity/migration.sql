-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "soldQuantity" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Coupon" ADD COLUMN     "soldQuantity" INTEGER NOT NULL DEFAULT 0;
