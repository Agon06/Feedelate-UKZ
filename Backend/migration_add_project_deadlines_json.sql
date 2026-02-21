-- Adds JSON column for storing project deadlines list
-- This allows professors to create multiple project submission deadlines
-- Similar to ideaDeadlinesJson for idea submissions

ALTER TABLE lendet
ADD COLUMN projectDeadlinesJson JSON NULL;
