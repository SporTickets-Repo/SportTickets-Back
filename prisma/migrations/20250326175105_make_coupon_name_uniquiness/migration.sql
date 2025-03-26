/*
  Warnings:

  - A unique constraint covering the columns `[eventId,name]` on the table `Coupon` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Coupon_eventId_name_key" ON "Coupon"("eventId", "name");
