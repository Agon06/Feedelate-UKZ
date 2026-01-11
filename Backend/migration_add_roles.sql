-- Migration: Add multi-role support
-- Add roles column to studentet, profesoret, and admins tables

-- Add roles column to studentet
ALTER TABLE `studentet` 
ADD COLUMN `roles` TEXT DEFAULT '["student"]' AFTER `profilePicture`,
ADD COLUMN `ssoProvider` VARCHAR(50) AFTER `roles`,
ADD COLUMN `ssoProviderId` VARCHAR(255) AFTER `ssoProvider`;

-- Add roles column to profesoret
ALTER TABLE `profesoret` 
ADD COLUMN `profilePicture` LONGTEXT AFTER `telefoni`,
ADD COLUMN `ssoProvider` VARCHAR(50) AFTER `profilePicture`,
ADD COLUMN `ssoProviderId` VARCHAR(255) AFTER `ssoProvider`,
ADD COLUMN `roles` TEXT DEFAULT '["profesor"]' AFTER `ssoProviderId`;

-- Update admins table
ALTER TABLE `admins` 
CHANGE COLUMN `role` `adminLevel` VARCHAR(50) DEFAULT 'admin',
ADD COLUMN `roles` TEXT DEFAULT '["admin"]' AFTER `adminLevel`;

-- Update existing records to have proper role JSON
UPDATE `studentet` SET `roles` = '["student"]' WHERE `roles` IS NULL OR `roles` = '';
UPDATE `profesoret` SET `roles` = '["profesor"]' WHERE `roles` IS NULL OR `roles` = '';
UPDATE `admins` SET `roles` = '["admin"]' WHERE `roles` IS NULL OR `roles` = '';
