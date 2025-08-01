-- Add new columns to the investigation table
ALTER TABLE "investigations" ADD COLUMN "doctor" TEXT;
ALTER TABLE "investigations" ADD COLUMN "results" TEXT;
ALTER TABLE "investigations" ADD COLUMN "normalRange" TEXT;
ALTER TABLE "investigations" ADD COLUMN "followUpNeeded" BOOLEAN DEFAULT FALSE;
ALTER TABLE "investigations" ADD COLUMN "followUpDate" DATETIME;
ALTER TABLE "investigations" ADD COLUMN "notes" TEXT;
