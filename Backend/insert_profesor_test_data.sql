-- SQL për të shtuar të dhëna test për Profesor

-- Insert test subjects for Lendetp
INSERT INTO lendetp (emriLendes, semestri, viti, isZgjedhore, createdAt, updatedAt) VALUES
('Algoritmet dhe Strukturat e të Dhënave', 1, 1, 0, NOW(), NOW()),
('Programimi i Orientuar në Objekte', 1, 1, 0, NOW(), NOW()),
('Matematika Diskrete', 1, 1, 0, NOW(), NOW()),
('Bazat e të Dhënave', 2, 1, 0, NOW(), NOW()),
('Inxhinieria e Softuerit', 2, 1, 0, NOW(), NOW()),
('Rrjetat Kompjuterike', 3, 2, 0, NOW(), NOW()),
('Siguria e Informacionit', 3, 2, 0, NOW(), NOW()),
('Inteligjenca Artificiale', 4, 2, 1, NOW(), NOW()),
('Machine Learning', 4, 2, 1, NOW(), NOW()),
('Sistemet e Distribuuara', 5, 3, 0, NOW(), NOW()),
('Cloud Computing', 5, 3, 1, NOW(), NOW()),
('Aplikacione Mobile', 6, 3, 1, NOW(), NOW());

-- Insert a test professor if not exists
INSERT INTO profesoret (emri, mbiemri, email, password, departamenti, grada, telefoni, createdAt, updatedAt) 
VALUES ('Test', 'Profesor', 'test.profesor@uni-gjilan.net', '$2b$10$testHashedPassword', 'Informatikë', 'Profesor i Asociuar', '+383 44 123 456', NOW(), NOW())
ON DUPLICATE KEY UPDATE emri=emri;
