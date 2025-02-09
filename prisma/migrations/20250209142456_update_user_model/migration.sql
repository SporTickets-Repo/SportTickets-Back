/*
  Warnings:

  - A unique constraint covering the columns `[document]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `cep` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `profileImageUrl` to the `User` table without a default value. This is not possible if the table is not empty.
  - Made the column `document` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "cep" TEXT NOT NULL,
ADD COLUMN     "profileImageUrl" TEXT NOT NULL,
ALTER COLUMN "document" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_document_key" ON "User"("document");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
