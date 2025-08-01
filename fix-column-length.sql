-- SQL migration to fix JSON column length limitation
-- This will change VARCHAR(191) columns to TEXT to prevent truncation

ALTER TABLE patients 
MODIFY COLUMN medicalHistory TEXT,
MODIFY COLUMN physicalGenerals TEXT,
MODIFY COLUMN menstrualHistory TEXT,
MODIFY COLUMN foodAndHabit TEXT;
