-- Fix for existing data during multi-tenant upgrade
-- This script handles edge cases in existing data that might cause issues

-- Set default values for new columns in patients table
-- Ensure that all patients have a valid branchId (handled by seed-tenants.js as well)
UPDATE patients 
SET branchId = (SELECT id FROM branches LIMIT 1)
WHERE branchId IS NULL OR branchId = '';

-- Make sure all investigations have default values for new fields
-- This is needed to avoid null constraint errors
UPDATE investigations
SET doctor = '' WHERE doctor IS NULL;

-- Disable foreign key constraints temporarily to avoid cascade issues
PRAGMA foreign_keys=OFF;

-- Update any user references that might be dangling
UPDATE users
SET clinicId = NULL, branchId = NULL
WHERE role = 'superadmin';

-- Re-enable foreign key constraints
PRAGMA foreign_keys=ON;

-- Validate foreign key constraints
PRAGMA foreign_key_check;
