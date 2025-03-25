/*
  Warnings:

  - You are about to drop the column `bairro` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `cep` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `complemento` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `ddd` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `estado` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `gia` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `ibge` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `localidade` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `logradouro` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `regiao` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `siafi` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `uf` on the `AddressEvent` table. All the data in the column will be lost.
  - You are about to drop the column `unidade` on the `AddressEvent` table. All the data in the column will be lost.
  - Added the required column `zipCode` to the `AddressEvent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AddressEvent" DROP COLUMN "bairro",
DROP COLUMN "cep",
DROP COLUMN "complemento",
DROP COLUMN "ddd",
DROP COLUMN "estado",
DROP COLUMN "gia",
DROP COLUMN "ibge",
DROP COLUMN "localidade",
DROP COLUMN "logradouro",
DROP COLUMN "regiao",
DROP COLUMN "siafi",
DROP COLUMN "uf",
DROP COLUMN "unidade",
ADD COLUMN     "city" TEXT,
ADD COLUMN     "complement" TEXT,
ADD COLUMN     "neighborhood" TEXT,
ADD COLUMN     "number" TEXT,
ADD COLUMN     "state" TEXT,
ADD COLUMN     "street" TEXT,
ADD COLUMN     "zipCode" TEXT NOT NULL;
