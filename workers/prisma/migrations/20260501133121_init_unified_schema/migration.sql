/*
  Warnings:

  - You are about to drop the column `addressLine1` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `addressLine2` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `city` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `landmark` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `lga` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `paymentMethod` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `Order` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `provider` on the `Shipment` table. All the data in the column will be lost.
  - You are about to drop the `WhatsAppOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `WhatsAppOrderItem` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `providerId` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "OrderChannel" AS ENUM ('WHATSAPP', 'WEB', 'IN_STORE', 'OTHER');

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_userId_fkey";

-- DropForeignKey
ALTER TABLE "WhatsAppOrder" DROP CONSTRAINT "WhatsAppOrder_finalOrderId_fkey";

-- DropForeignKey
ALTER TABLE "WhatsAppOrder" DROP CONSTRAINT "WhatsAppOrder_userId_fkey";

-- DropForeignKey
ALTER TABLE "WhatsAppOrderItem" DROP CONSTRAINT "WhatsAppOrderItem_variantId_fkey";

-- DropForeignKey
ALTER TABLE "WhatsAppOrderItem" DROP CONSTRAINT "WhatsAppOrderItem_whatsappOrderId_fkey";

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "addressLine1",
DROP COLUMN "addressLine2",
DROP COLUMN "city",
DROP COLUMN "landmark",
DROP COLUMN "lga",
DROP COLUMN "paymentMethod",
DROP COLUMN "state",
DROP COLUMN "userId",
ADD COLUMN     "addressId" TEXT,
ADD COLUMN     "channel" "OrderChannel" NOT NULL DEFAULT 'WHATSAPP',
ADD COLUMN     "customerId" TEXT,
ADD COLUMN     "deliveryMethod" "DeliveryMethod" NOT NULL DEFAULT 'DELIVERY',
ADD COLUMN     "lastMessageAt" TIMESTAMP(3),
ADD COLUMN     "whatsappSessionId" TEXT;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "provider",
ADD COLUMN     "providerId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Shipment" DROP COLUMN "provider",
ADD COLUMN     "providerId" TEXT;

-- DropTable
DROP TABLE "WhatsAppOrder";

-- DropTable
DROP TABLE "WhatsAppOrderItem";

-- DropEnum
DROP TYPE "PaymentProvider";

-- DropEnum
DROP TYPE "ShipmentProvider";

-- DropEnum
DROP TYPE "WhatsAppOrderStatus";

-- DropEnum
DROP TYPE "WhatsAppPaymentMethod";

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "primaryPhone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "city" TEXT,
    "state" TEXT NOT NULL,
    "lga" TEXT,
    "landmark" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentProvider" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PaymentProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShipmentProvider" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ShipmentProvider_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Customer_userId_key" ON "Customer"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PaymentProvider_code_key" ON "PaymentProvider"("code");

-- CreateIndex
CREATE UNIQUE INDEX "ShipmentProvider_code_key" ON "ShipmentProvider"("code");

-- CreateIndex
CREATE INDEX "Order_channel_idx" ON "Order"("channel");

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_addressId_fkey" FOREIGN KEY ("addressId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "PaymentProvider"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Shipment" ADD CONSTRAINT "Shipment_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "ShipmentProvider"("id") ON DELETE SET NULL ON UPDATE CASCADE;
