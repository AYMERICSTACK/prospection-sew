-- CreateEnum
CREATE TYPE "ProspectStatus" AS ENUM ('NEW', 'TO_REVIEW', 'QUALIFIED', 'CONTACTED', 'FOLLOW_UP', 'WON', 'LOST', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "CommercialStage" AS ENUM ('PROSPECT', 'TARGET', 'CLIENT', 'INACTIVE');

-- CreateEnum
CREATE TYPE "CompanyActivityType" AS ENUM ('CALL', 'EMAIL', 'VISIT', 'FLYER', 'FOLLOW_UP', 'NOTE');

-- CreateEnum
CREATE TYPE "CompanyActivityResult" AS ENUM ('NO_ANSWER', 'NOT_INTERESTED', 'TO_CALL_BACK', 'INTERESTED', 'APPOINTMENT_TO_SCHEDULE', 'APPOINTMENT_BOOKED', 'QUOTE_REQUESTED', 'ALREADY_EQUIPPED', 'WRONG_CONTACT', 'INFORMATION_SENT', 'OTHER');

-- CreateTable
CREATE TABLE "Company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tradeName" TEXT,
    "businessKeywords" TEXT,
    "siren" TEXT,
    "siret" TEXT,
    "nafCode" TEXT,
    "nafLabel" TEXT,
    "city" TEXT,
    "postalCode" TEXT,
    "address" TEXT,
    "region" TEXT,
    "website" TEXT,
    "email" TEXT,
    "emailStatus" TEXT,
    "emailSource" TEXT,
    "employeeRange" TEXT,
    "source" TEXT,
    "commercialStage" "CommercialStage" NOT NULL DEFAULT 'PROSPECT',
    "lastContactAt" TIMESTAMP(3),
    "nextFollowUpAt" TIMESTAMP(3),
    "lastContactResult" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Prospect" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "ProspectStatus" NOT NULL DEFAULT 'NEW',
    "score" INTEGER NOT NULL DEFAULT 0,
    "whyRelevant" TEXT,
    "pitchAngle" TEXT,
    "notes" TEXT,
    "websiteScan" TEXT,
    "websiteScore" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Prospect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CompanyActivity" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "type" "CompanyActivityType" NOT NULL,
    "result" "CompanyActivityResult",
    "notes" TEXT,
    "actionDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "nextFollowUpAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CompanyActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Company_siren_key" ON "Company"("siren");

-- CreateIndex
CREATE UNIQUE INDEX "Company_siret_key" ON "Company"("siret");

-- CreateIndex
CREATE UNIQUE INDEX "Prospect_companyId_key" ON "Prospect"("companyId");

-- CreateIndex
CREATE INDEX "CompanyActivity_companyId_actionDate_idx" ON "CompanyActivity"("companyId", "actionDate");

-- AddForeignKey
ALTER TABLE "Prospect" ADD CONSTRAINT "Prospect_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyActivity" ADD CONSTRAINT "CompanyActivity_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;
