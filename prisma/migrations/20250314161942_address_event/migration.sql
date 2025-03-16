-- AlterTable
ALTER TABLE "TicketLot" ALTER COLUMN "isActive" SET DEFAULT false;

-- CreateTable
CREATE TABLE "AddressEvent" (
    "id" UUID NOT NULL,
    "eventId" UUID NOT NULL,
    "cep" TEXT NOT NULL,
    "logradouro" TEXT,
    "complemento" TEXT,
    "unidade" TEXT,
    "bairro" TEXT,
    "localidade" TEXT,
    "uf" TEXT,
    "estado" TEXT,
    "regiao" TEXT,
    "ibge" TEXT,
    "gia" TEXT,
    "ddd" TEXT,
    "siafi" TEXT,

    CONSTRAINT "AddressEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AddressEvent_eventId_key" ON "AddressEvent"("eventId");

-- AddForeignKey
ALTER TABLE "AddressEvent" ADD CONSTRAINT "AddressEvent_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
