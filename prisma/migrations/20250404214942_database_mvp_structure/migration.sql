-- CreateEnum
CREATE TYPE "Role" AS ENUM ('MASTER', 'ADMIN', 'PARTNER', 'USER');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('CPF');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'REGISTRATION', 'PROGRESS', 'CANCELLED', 'FINISHED');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('FUTVOLEI', 'BEACH_TENIS', 'ALTINHA', 'FUTEBOL', 'FUTEBOL_ARREIA', 'FUTSAL', 'VOLEI', 'GENERAL');

-- CreateEnum
CREATE TYPE "EventLevel" AS ENUM ('BEGINNER', 'AMATEUR', 'SEMIPROFESSIONAL', 'PROFESSIONAL', 'GENERAL');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'APPROVED', 'AUTHORIZED', 'IN_PROCESS', 'IN_MEDIATION', 'REJECTED', 'CANCELLED', 'REFUNDED', 'CHARGED_BACK');

-- CreateEnum
CREATE TYPE "Restriction" AS ENUM ('NONE', 'SAME_CATEGORY');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('ATHLETE', 'VIEWER');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('PIX', 'CREDIT_CARD', 'BOLETO');

-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'PAYPAL', 'MERCADOPAGO');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "document" TEXT NOT NULL,
    "documentType" "DocumentType" NOT NULL DEFAULT 'CPF',
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "sex" "Sex" NOT NULL DEFAULT 'FEMALE',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "bornAt" TIMESTAMP(3),
    "cep" TEXT,
    "profileImageUrl" TEXT,
    "siteUrl" TEXT,
    "logoUrl" TEXT,
    "fantasyName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" UUID NOT NULL,
    "createdBy" UUID NOT NULL,
    "slug" TEXT,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "type" "EventType" NOT NULL DEFAULT 'GENERAL',
    "level" "EventLevel" NOT NULL DEFAULT 'GENERAL',
    "name" TEXT,
    "place" TEXT,
    "description" TEXT,
    "regulation" TEXT,
    "additionalInfo" TEXT,
    "bannerUrl" TEXT,
    "smallImageUrl" TEXT,
    "endDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "eventFee" DECIMAL(65,30),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentMethods" "PaymentMethod"[],

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" UUID NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "totalValue" DECIMAL(65,30) NOT NULL,
    "createdById" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "paymentMethod" TEXT,
    "externalPaymentId" TEXT,
    "externalStatus" TEXT,
    "paymentProvider" "PaymentProvider",
    "paidAt" TIMESTAMP(3),
    "pixQRCode" TEXT,
    "response" JSONB,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Coupon" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "createdBy" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "soldQuantity" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Coupon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "transactionId" UUID NOT NULL,
    "ticketLotId" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "couponId" UUID,
    "price" DECIMAL(65,30) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "code" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "teamId" UUID,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Team" (
    "id" UUID NOT NULL,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bracket" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "Bracket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ranking" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "Ranking_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" UUID NOT NULL,
    "ticketTypeId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "restriction" "Restriction" NOT NULL DEFAULT 'NONE',
    "quantity" INTEGER NOT NULL,
    "soldQuantity" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketType" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "userType" "UserType" NOT NULL DEFAULT 'ATHLETE',
    "teamSize" INTEGER NOT NULL DEFAULT 1,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TicketType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizedField" (
    "id" UUID NOT NULL,
    "ticketTypeId" UUID NOT NULL,
    "type" TEXT NOT NULL,
    "requestTitle" TEXT NOT NULL,
    "optionsList" JSONB,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "PersonalizedField_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalizedFieldAnswer" (
    "id" UUID NOT NULL,
    "personalizedFieldId" UUID NOT NULL,
    "ticketId" UUID NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "PersonalizedFieldAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketLot" (
    "id" UUID NOT NULL,
    "ticketTypeId" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "soldQuantity" INTEGER NOT NULL DEFAULT 0,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TicketLot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDashboardAccess" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "eventId" UUID NOT NULL,

    CONSTRAINT "EventDashboardAccess_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AddressEvent" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "zipCode" TEXT NOT NULL,
    "street" TEXT,
    "complement" TEXT,
    "number" TEXT,
    "neighborhood" TEXT,
    "city" TEXT,
    "state" TEXT,

    CONSTRAINT "AddressEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_document_key" ON "User"("document");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Coupon_deletedAt_idx" ON "Coupon"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_code_key" ON "Ticket"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EventDashboardAccess_userId_eventId_key" ON "EventDashboardAccess"("userId", "eventId");

-- CreateIndex
CREATE UNIQUE INDEX "AddressEvent_eventId_key" ON "AddressEvent"("eventId");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Coupon" ADD CONSTRAINT "Coupon_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_ticketLotId_fkey" FOREIGN KEY ("ticketLotId") REFERENCES "TicketLot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Bracket" ADD CONSTRAINT "Bracket_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ranking" ADD CONSTRAINT "Ranking_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketType" ADD CONSTRAINT "TicketType_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedField" ADD CONSTRAINT "PersonalizedField_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedFieldAnswer" ADD CONSTRAINT "PersonalizedFieldAnswer_personalizedFieldId_fkey" FOREIGN KEY ("personalizedFieldId") REFERENCES "PersonalizedField"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalizedFieldAnswer" ADD CONSTRAINT "PersonalizedFieldAnswer_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketLot" ADD CONSTRAINT "TicketLot_ticketTypeId_fkey" FOREIGN KEY ("ticketTypeId") REFERENCES "TicketType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDashboardAccess" ADD CONSTRAINT "EventDashboardAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDashboardAccess" ADD CONSTRAINT "EventDashboardAccess_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AddressEvent" ADD CONSTRAINT "AddressEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
