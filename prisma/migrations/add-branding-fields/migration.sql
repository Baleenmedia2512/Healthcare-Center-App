-- CreateBrandingFieldsMigration

-- Add branding fields to clinics
ALTER TABLE "clinics" ADD COLUMN "logoUrl" TEXT;
ALTER TABLE "clinics" ADD COLUMN "faviconUrl" TEXT;
ALTER TABLE "clinics" ADD COLUMN "primaryColor" TEXT DEFAULT '#84c9ef';
ALTER TABLE "clinics" ADD COLUMN "secondaryColor" TEXT DEFAULT '#b4d2ed';
ALTER TABLE "clinics" ADD COLUMN "customCss" TEXT;
ALTER TABLE "clinics" ADD COLUMN "customDomain" TEXT UNIQUE;
