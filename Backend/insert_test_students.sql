-- Insert test students
USE feedelate;

-- Insert a test student with ID 1
INSERT INTO student (id, emri, mbiemri, username, password, email, academicYear) 
VALUES 
  (1, 'Test', 'Student', 'test.student', '$2b$10$abcdefghijklmnopqrstuv', 'test.student@university.edu', '2025/2026'),
  (2, 'John', 'Doe', 'john.doe', '$2b$10$abcdefghijklmnopqrstuv', 'john.doe@university.edu', '2024/2025'),
  (3, 'Jane', 'Smith', 'jane.smith', '$2b$10$abcdefghijklmnopqrstuv', 'jane.smith@university.edu', '2025/2026')
ON DUPLICATE KEY UPDATE 
  emri = VALUES(emri),
  mbiemri = VALUES(mbiemri),
  academicYear = VALUES(academicYear);

SELECT 'Test students inserted successfully!' AS message;
