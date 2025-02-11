-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_bracketId_fkey";

-- AlterTable
ALTER TABLE "Event" ALTER COLUMN "bracketId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_bracketId_fkey" FOREIGN KEY ("bracketId") REFERENCES "Bracket"("id") ON DELETE SET NULL ON UPDATE CASCADE;
