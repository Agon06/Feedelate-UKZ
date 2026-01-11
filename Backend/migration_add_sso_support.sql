-- Migration script to add SSO support to the studentet table
-- Run this on your database before testing SSO

USE feedelate;

-- Make password optional (nullable) since SSO users won't have passwords
ALTER TABLE studentet 
MODIFY COLUMN password VARCHAR(255) NULL;

-- Add SSO provider fields
ALTER TABLE studentet 
ADD COLUMN IF NOT EXISTS ssoProvider VARCHAR(50) NULL COMMENT 'OAuth provider: google, microsoft, etc.',
ADD COLUMN IF NOT EXISTS ssoProviderId VARCHAR(255) NULL COMMENT 'Unique ID from SSO provider',
ADD COLUMN IF NOT EXISTS profilePicture TEXT NULL COMMENT 'Profile picture URL from SSO';

-- Create index for faster SSO lookups
CREATE INDEX IF NOT EXISTS idx_sso_provider_id ON studentet(ssoProvider, ssoProviderId);

-- Show the updated table structure
DESCRIBE studentet;

SELECT 'Migration completed successfully!' AS status;
