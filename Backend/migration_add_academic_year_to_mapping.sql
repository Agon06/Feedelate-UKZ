-- Add academicYear column to profesor_lendet_mapping table
ALTER TABLE profesor_lendet_mapping 
ADD COLUMN academicYear VARCHAR(9) NOT NULL DEFAULT '2023/2024' AFTER lendetId;

-- Update unique constraint to include academicYear
ALTER TABLE profesor_lendet_mapping 
DROP INDEX uk_profesor_lendet,
ADD UNIQUE KEY uk_profesor_lendet_year (profesorId, lendetId, academicYear);
