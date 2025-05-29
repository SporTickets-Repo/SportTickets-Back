-- CreateEnum
CREATE TYPE "Currency" AS ENUM ('BRL', 'AUD');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "country" "Country" NOT NULL DEFAULT 'BRAZIL',
ADD COLUMN     "currency" "Currency" NOT NULL DEFAULT 'BRL';
