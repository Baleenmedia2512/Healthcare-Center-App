-- CreateTable
CREATE TABLE "clinics" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "clinicId" TEXT NOT NULL,
    CONSTRAINT "branches_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES "clinics" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Update existing tables

-- Add branchId to patients
ALTER TABLE "patients" ADD COLUMN "branchId" TEXT NOT NULL DEFAULT '';
-- After adding all branches, this needs to be updated for existing patients

-- Add clinicId and branchId to users
ALTER TABLE "users" ADD COLUMN "clinicId" TEXT;
ALTER TABLE "users" ADD COLUMN "branchId" TEXT;

-- Add Foreign Key constraints
PRAGMA foreign_keys=OFF;

-- Create indexes for better performance
CREATE INDEX "idx_users_clinic" ON "users"("clinicId");
CREATE INDEX "idx_users_branch" ON "users"("branchId");
CREATE INDEX "idx_patients_branch" ON "patients"("branchId");
CREATE INDEX "idx_branches_clinic" ON "branches"("clinicId");

-- Enable Foreign key constraints
PRAGMA foreign_keys=ON;

-- Update the existing users role field to accommodate new roles
-- This part is a placeholder - SQLite doesn't support altering enums
-- You'll need to handle this in the application logic
