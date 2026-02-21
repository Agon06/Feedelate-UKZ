-- Migration: Remove departamenti, grada, telefoni columns from profesoret table
ALTER TABLE profesoret 
DROP COLUMN departamenti,
DROP COLUMN grada,
DROP COLUMN telefoni;
