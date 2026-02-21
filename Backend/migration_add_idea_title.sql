-- Migration: Add ideaTitle column to lendet table
-- This allows professors to set custom titles for idea submission deadlines

ALTER TABLE lendet
ADD COLUMN ideaTitle VARCHAR(255) NULL COMMENT 'Titulli custom i afatit të dorëzimit të idesë';
