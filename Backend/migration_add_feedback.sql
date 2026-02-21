-- Migration: Shto fushat e feedback-ut në tabelën dorezimiides

-- Shto kolona të reja për feedback
ALTER TABLE dorezimiides 
ADD COLUMN feedbackText TEXT NULL AFTER isShabllon,
ADD COLUMN feedbackDate DATETIME NULL AFTER feedbackText,
ADD COLUMN vleresimi VARCHAR(50) NULL AFTER feedbackDate;

-- Verifikim
SELECT 'Migration completed successfully!' AS status;
DESCRIBE dorezimiides;
