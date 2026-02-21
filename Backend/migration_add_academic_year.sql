-- Migration: Add academicYear to studentet table
ALTER TABLE studentet ADD COLUMN academicYear VARCHAR(32) NULL;