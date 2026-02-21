-- Adds JSON column for storing idea deadlines list
ALTER TABLE lendet
ADD COLUMN ideaDeadlinesJson JSON NULL;
