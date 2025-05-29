-- CreateEnum
CREATE TYPE "Country" AS ENUM ('BRAZIL', 'AUSTRALIA');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "country" "Country" NOT NULL DEFAULT 'BRAZIL',
ALTER COLUMN "document" DROP NOT NULL,
ALTER COLUMN "documentType" DROP NOT NULL;
