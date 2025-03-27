/*
  Warnings:

  - A unique constraint covering the columns `[userId,eventId]` on the table `EventDashboardAccess` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "EventDashboardAccess_userId_eventId_key" ON "EventDashboardAccess"("userId", "eventId");
