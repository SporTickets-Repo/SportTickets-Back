-- DropForeignKey
ALTER TABLE "Ticket" DROP CONSTRAINT "Ticket_categoryId_fkey";

-- AlterTable
ALTER TABLE "Ticket" ALTER COLUMN "categoryId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE;
