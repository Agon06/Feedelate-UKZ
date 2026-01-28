-- Run these SQL commands in your MySQL client to create the mapping table

-- Create junction table for professor-subject assignments
CREATE TABLE IF NOT EXISTS profesor_lendet_mapping (
    id INT AUTO_INCREMENT PRIMARY KEY,
    profesorId INT NOT NULL,
    lendetId INT NOT NULL,
    assignedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_profesor_lendet (profesorId, lendetId),
    KEY idx_profesorId (profesorId),
    KEY idx_lendetId (lendetId),
    FOREIGN KEY (lendetId) REFERENCES lendet(id) ON DELETE CASCADE ON UPDATE NO ACTION
);

-- Insert existing assignments from lendet.profesorId if any exist
INSERT IGNORE INTO profesor_lendet_mapping (profesorId, lendetId)
SELECT profesorId, id FROM lendet WHERE profesorId IS NOT NULL;

-- Now we can safely make profesorId nullable/default in lendet (optional cleanup)
ALTER TABLE lendet MODIFY COLUMN profesorId INT NULL DEFAULT NULL;
