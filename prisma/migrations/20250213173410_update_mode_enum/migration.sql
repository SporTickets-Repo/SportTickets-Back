/*
  Warnings:

  - The values [INDIVUAL] on the enum `Mode` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Mode_new" AS ENUM ('SOLO', 'DUO');
ALTER TABLE "TicketType" ALTER COLUMN "mode" DROP DEFAULT;
ALTER TABLE "TicketType" ALTER COLUMN "mode" TYPE "Mode_new" USING ("mode"::text::"Mode_new");
ALTER TYPE "Mode" RENAME TO "Mode_old";
ALTER TYPE "Mode_new" RENAME TO "Mode";
DROP TYPE "Mode_old";
ALTER TABLE "TicketType" ALTER COLUMN "mode" SET DEFAULT 'DUO';
COMMIT;
