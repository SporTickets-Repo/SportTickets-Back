/*
  Warnings:

  - The values [GERAL] on the enum `EventType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `title` on the `Event` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EventLevel" AS ENUM ('BEGINNER', 'AMATEUR', 'SEMIPROFESSIONAL', 'PROFESSIONAL', 'GENERAL');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD', 'BOLETO');

-- AlterEnum
BEGIN;
CREATE TYPE "EventType_new" AS ENUM ('FUTVOLEI', 'BEACH_TENIS', 'ALTINHA', 'FUTEBOL', 'FUTEBOL_ARREIA', 'FUTSAL', 'VOLEI', 'GENERAL');
ALTER TABLE "Event" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "Event" ALTER COLUMN "type" TYPE "EventType_new" USING ("type"::text::"EventType_new");
ALTER TYPE "EventType" RENAME TO "EventType_old";
ALTER TYPE "EventType_new" RENAME TO "EventType";
DROP TYPE "EventType_old";
ALTER TABLE "Event" ALTER COLUMN "type" SET DEFAULT 'GENERAL';
COMMIT;

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "title",
ADD COLUMN     "level" "EventLevel" NOT NULL DEFAULT 'GENERAL',
ADD COLUMN     "paymentMethods" "PaymentMethod"[],
ADD COLUMN     "smallImageUrl" TEXT,
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "place" DROP NOT NULL,
ALTER COLUMN "description" DROP NOT NULL,
ALTER COLUMN "endDate" DROP NOT NULL,
ALTER COLUMN "startDate" DROP NOT NULL,
ALTER COLUMN "slug" DROP NOT NULL,
ALTER COLUMN "type" SET DEFAULT 'GENERAL';
