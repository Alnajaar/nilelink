/*
  Warnings:

  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `magicUserId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `tenantId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ApiKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Currency` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CustomerProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DomainEvent` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `EventSnapshot` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ExchangeRate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ImportJob` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Inventory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InventoryMovement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvestorDistribution` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `InvestorProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JournalEntry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JournalLine` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MenuItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Order` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrderItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Payment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Permission` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Restaurant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RestaurantProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Role` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Settlement` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Shift` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `StaffProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Supplier` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SystemConfig` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Tenant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TenantSettings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_PermissionToRole` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_RoleToUser` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[email]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "BillingCycle" AS ENUM ('MONTHLY', 'YEARLY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "SubscriptionVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "SubscriptionPlanStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BenefitType" AS ENUM ('DISCOUNT', 'FREE_DELIVERY', 'EARLY_ACCESS', 'EXCLUSIVE_ITEM', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CustomerSubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAST_DUE', 'CANCELLED', 'EXPIRED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('SUBSCRIPTION_PAYMENT', 'RENEWAL', 'UPGRADE', 'DOWNGRADE', 'REFUND', 'TRIAL_CONVERSION');

-- DropForeignKey
ALTER TABLE "CustomerProfile" DROP CONSTRAINT "CustomerProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "ExchangeRate" DROP CONSTRAINT "ExchangeRate_fromCurrencyCode_fkey";

-- DropForeignKey
ALTER TABLE "ExchangeRate" DROP CONSTRAINT "ExchangeRate_toCurrencyCode_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Inventory" DROP CONSTRAINT "Inventory_supplierId_fkey";

-- DropForeignKey
ALTER TABLE "InventoryMovement" DROP CONSTRAINT "InventoryMovement_inventoryId_fkey";

-- DropForeignKey
ALTER TABLE "InvestorDistribution" DROP CONSTRAINT "InvestorDistribution_settlementId_fkey";

-- DropForeignKey
ALTER TABLE "InvestorProfile" DROP CONSTRAINT "InvestorProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "JournalLine" DROP CONSTRAINT "JournalLine_accountId_fkey";

-- DropForeignKey
ALTER TABLE "JournalLine" DROP CONSTRAINT "JournalLine_journalEntryId_fkey";

-- DropForeignKey
ALTER TABLE "MenuItem" DROP CONSTRAINT "MenuItem_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_customerId_fkey";

-- DropForeignKey
ALTER TABLE "Order" DROP CONSTRAINT "Order_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_menuItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItem" DROP CONSTRAINT "OrderItem_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_orderId_fkey";

-- DropForeignKey
ALTER TABLE "Restaurant" DROP CONSTRAINT "Restaurant_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "RestaurantProfile" DROP CONSTRAINT "RestaurantProfile_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "RestaurantProfile" DROP CONSTRAINT "RestaurantProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "Role" DROP CONSTRAINT "Role_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "Settlement" DROP CONSTRAINT "Settlement_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Shift" DROP CONSTRAINT "Shift_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "Shift" DROP CONSTRAINT "Shift_userId_fkey";

-- DropForeignKey
ALTER TABLE "StaffProfile" DROP CONSTRAINT "StaffProfile_restaurantId_fkey";

-- DropForeignKey
ALTER TABLE "StaffProfile" DROP CONSTRAINT "StaffProfile_userId_fkey";

-- DropForeignKey
ALTER TABLE "TenantSettings" DROP CONSTRAINT "TenantSettings_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_tenantId_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_A_fkey";

-- DropForeignKey
ALTER TABLE "_PermissionToRole" DROP CONSTRAINT "_PermissionToRole_B_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToUser" DROP CONSTRAINT "_RoleToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_RoleToUser" DROP CONSTRAINT "_RoleToUser_B_fkey";

-- DropIndex
DROP INDEX "User_isActive_idx";

-- DropIndex
DROP INDEX "User_magicUserId_key";

-- DropIndex
DROP INDEX "User_tenantId_email_key";

-- DropIndex
DROP INDEX "User_tenantId_idx";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "isActive",
DROP COLUMN "isVerified",
DROP COLUMN "magicUserId",
DROP COLUMN "tenantId";

-- DropTable
DROP TABLE "Account";

-- DropTable
DROP TABLE "ApiKey";

-- DropTable
DROP TABLE "AuditLog";

-- DropTable
DROP TABLE "Currency";

-- DropTable
DROP TABLE "CustomerProfile";

-- DropTable
DROP TABLE "DomainEvent";

-- DropTable
DROP TABLE "EventSnapshot";

-- DropTable
DROP TABLE "ExchangeRate";

-- DropTable
DROP TABLE "ImportJob";

-- DropTable
DROP TABLE "Inventory";

-- DropTable
DROP TABLE "InventoryMovement";

-- DropTable
DROP TABLE "InvestorDistribution";

-- DropTable
DROP TABLE "InvestorProfile";

-- DropTable
DROP TABLE "JournalEntry";

-- DropTable
DROP TABLE "JournalLine";

-- DropTable
DROP TABLE "MenuItem";

-- DropTable
DROP TABLE "Order";

-- DropTable
DROP TABLE "OrderItem";

-- DropTable
DROP TABLE "Payment";

-- DropTable
DROP TABLE "Permission";

-- DropTable
DROP TABLE "Restaurant";

-- DropTable
DROP TABLE "RestaurantProfile";

-- DropTable
DROP TABLE "Role";

-- DropTable
DROP TABLE "Settlement";

-- DropTable
DROP TABLE "Shift";

-- DropTable
DROP TABLE "StaffProfile";

-- DropTable
DROP TABLE "Supplier";

-- DropTable
DROP TABLE "SystemConfig";

-- DropTable
DROP TABLE "Tenant";

-- DropTable
DROP TABLE "TenantSettings";

-- DropTable
DROP TABLE "_PermissionToRole";

-- DropTable
DROP TABLE "_RoleToUser";

-- DropEnum
DROP TYPE "AccountCategory";

-- DropEnum
DROP TYPE "AccountType";

-- DropEnum
DROP TYPE "Action";

-- DropEnum
DROP TYPE "DistributionStatus";

-- DropEnum
DROP TYPE "ImportStatus";

-- DropEnum
DROP TYPE "ImportType";

-- DropEnum
DROP TYPE "InventoryMovementType";

-- DropEnum
DROP TYPE "KycStatus";

-- DropEnum
DROP TYPE "OrderStatus";

-- DropEnum
DROP TYPE "PaymentMethod";

-- DropEnum
DROP TYPE "PaymentStatus";

-- DropEnum
DROP TYPE "Plan";

-- DropEnum
DROP TYPE "Resource";

-- DropEnum
DROP TYPE "SettlementStatus";

-- DropEnum
DROP TYPE "StaffRole";

-- DropEnum
DROP TYPE "UserRole";

-- CreateTable
CREATE TABLE "MarketplaceSeller" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "description" TEXT,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketplaceSeller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionPlan" (
    "id" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "richDescription" TEXT,
    "logoUrl" TEXT,
    "bannerUrl" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "billingCycle" "BillingCycle" NOT NULL DEFAULT 'MONTHLY',
    "trialDays" INTEGER DEFAULT 0,
    "maxSubscribers" INTEGER,
    "visibility" "SubscriptionVisibility" NOT NULL DEFAULT 'PUBLIC',
    "inviteCode" TEXT,
    "status" "SubscriptionPlanStatus" NOT NULL DEFAULT 'DRAFT',
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "cancellationRules" JSONB,
    "subscriberCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionBenefit" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "type" "BenefitType" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "value" JSONB,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "SubscriptionBenefit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomerSubscription" (
    "id" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" "CustomerSubscriptionStatus" NOT NULL DEFAULT 'PENDING',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "trialEndDate" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),
    "autoRenew" BOOLEAN NOT NULL DEFAULT true,
    "lastBilledAt" TIMESTAMP(3),
    "nextBillingDate" TIMESTAMP(3),
    "paymentMethodId" TEXT,
    "totalPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "renewalCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomerSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionTransaction" (
    "id" TEXT NOT NULL,
    "subscriptionId" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "type" "TransactionType" NOT NULL,
    "paymentMethodId" TEXT,
    "transactionId" TEXT,
    "blockchainTxHash" TEXT,
    "processedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "billingCycle" "BillingCycle",
    "periodStart" TIMESTAMP(3),
    "periodEnd" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Web3SubscriptionContract" (
    "id" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "contractAddress" TEXT NOT NULL,
    "network" TEXT NOT NULL,
    "abi" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "deployedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Web3SubscriptionContract_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MarketplaceSeller_email_key" ON "MarketplaceSeller"("email");

-- CreateIndex
CREATE INDEX "MarketplaceSeller_email_idx" ON "MarketplaceSeller"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlan_inviteCode_key" ON "SubscriptionPlan"("inviteCode");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_sellerId_idx" ON "SubscriptionPlan"("sellerId");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_status_idx" ON "SubscriptionPlan"("status");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_visibility_idx" ON "SubscriptionPlan"("visibility");

-- CreateIndex
CREATE INDEX "SubscriptionPlan_createdAt_idx" ON "SubscriptionPlan"("createdAt");

-- CreateIndex
CREATE INDEX "SubscriptionBenefit_planId_idx" ON "SubscriptionBenefit"("planId");

-- CreateIndex
CREATE INDEX "SubscriptionBenefit_type_idx" ON "SubscriptionBenefit"("type");

-- CreateIndex
CREATE INDEX "SubscriptionBenefit_displayOrder_idx" ON "SubscriptionBenefit"("displayOrder");

-- CreateIndex
CREATE INDEX "CustomerSubscription_customerId_idx" ON "CustomerSubscription"("customerId");

-- CreateIndex
CREATE INDEX "CustomerSubscription_planId_idx" ON "CustomerSubscription"("planId");

-- CreateIndex
CREATE INDEX "CustomerSubscription_status_idx" ON "CustomerSubscription"("status");

-- CreateIndex
CREATE INDEX "CustomerSubscription_nextBillingDate_idx" ON "CustomerSubscription"("nextBillingDate");

-- CreateIndex
CREATE UNIQUE INDEX "CustomerSubscription_customerId_planId_key" ON "CustomerSubscription"("customerId", "planId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTransaction_transactionId_key" ON "SubscriptionTransaction"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionTransaction_blockchainTxHash_key" ON "SubscriptionTransaction"("blockchainTxHash");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_subscriptionId_idx" ON "SubscriptionTransaction"("subscriptionId");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_status_idx" ON "SubscriptionTransaction"("status");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_type_idx" ON "SubscriptionTransaction"("type");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_transactionId_idx" ON "SubscriptionTransaction"("transactionId");

-- CreateIndex
CREATE INDEX "SubscriptionTransaction_blockchainTxHash_idx" ON "SubscriptionTransaction"("blockchainTxHash");

-- CreateIndex
CREATE UNIQUE INDEX "Web3SubscriptionContract_planId_key" ON "Web3SubscriptionContract"("planId");

-- CreateIndex
CREATE UNIQUE INDEX "Web3SubscriptionContract_contractAddress_key" ON "Web3SubscriptionContract"("contractAddress");

-- CreateIndex
CREATE INDEX "Web3SubscriptionContract_planId_idx" ON "Web3SubscriptionContract"("planId");

-- CreateIndex
CREATE INDEX "Web3SubscriptionContract_network_idx" ON "Web3SubscriptionContract"("network");

-- CreateIndex
CREATE INDEX "Web3SubscriptionContract_isActive_idx" ON "Web3SubscriptionContract"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_emailVerified_idx" ON "User"("emailVerified");

-- CreateIndex
CREATE INDEX "User_isLocked_idx" ON "User"("isLocked");

-- AddForeignKey
ALTER TABLE "SubscriptionPlan" ADD CONSTRAINT "SubscriptionPlan_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "MarketplaceSeller"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionBenefit" ADD CONSTRAINT "SubscriptionBenefit_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerSubscription" ADD CONSTRAINT "CustomerSubscription_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomerSubscription" ADD CONSTRAINT "CustomerSubscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionTransaction" ADD CONSTRAINT "SubscriptionTransaction_subscriptionId_fkey" FOREIGN KEY ("subscriptionId") REFERENCES "CustomerSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Web3SubscriptionContract" ADD CONSTRAINT "Web3SubscriptionContract_planId_fkey" FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
