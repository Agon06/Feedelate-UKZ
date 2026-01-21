-- SQL për të shtuar lëndë test në tabelën e unifikuar 'lendet'
-- Këto lëndë do të jenë të lidhura me profesorId = 1

-- Para së gjithash, sigurohuni që profesori ekziston
INSERT INTO profesoret (id, emri, mbiemri, email, password, departamenti, grada, telefoni, createdAt, updatedAt) 
VALUES 
  (1, 'Fatmir', 'Morina', 'fatmir.morina@uni-gjilan.net', '$2b$10$testHashedPassword123456789', 'Informatikë', 'Profesor i Asociuar', '+383 44 111 222', NOW(), NOW())
ON DUPLICATE KEY UPDATE emri=emri;

-- VITI I (Semestri 1 dhe 2)
-- Semestri 1
INSERT INTO lendet (emriLendes, semestri, viti, isZgjedhore, profesorId, createdAt, updatedAt) VALUES
('Algoritmet dhe Strukturat e të Dhënave', 1, 1, 0, 1, NOW(), NOW()),
('Programimi i Orientuar në Objekte', 1, 1, 0, 1, NOW(), NOW()),
('Matematika Diskrete', 1, 1, 0, 1, NOW(), NOW()),
('Hyrje në Shkenca Kompjuterike', 1, 1, 0, 1, NOW(), NOW());

-- Semestri 2
INSERT INTO lendet (emriLendes, semestri, viti, isZgjedhore, profesorId, createdAt, updatedAt) VALUES
('Bazat e të Dhënave', 2, 1, 0, 1, NOW(), NOW()),
('Inxhinieria e Softuerit', 2, 1, 0, 1, NOW(), NOW()),
('Sistemet Operative', 2, 1, 0, 1, NOW(), NOW()),
('Rrjetat Kompjuterike Themelore', 2, 1, 0, 1, NOW(), NOW());

-- VITI II (Semestri 3 dhe 4)
-- Semestri 3
INSERT INTO lendet (emriLendes, semestri, viti, isZgjedhore, profesorId, createdAt, updatedAt) VALUES
('Rrjetat Kompjuterike të Avancuara', 3, 2, 0, 1, NOW(), NOW()),
('Siguria e Informacionit', 3, 2, 0, 1, NOW(), NOW()),
('Zhvillimi Web', 3, 2, 0, 1, NOW(), NOW());

-- Semestri 4
INSERT INTO lendet (emriLendes, semestri, viti, isZgjedhore, profesorId, createdAt, updatedAt) VALUES
('Inteligjenca Artificiale', 4, 2, 0, 1, NOW(), NOW()),
('Machine Learning', 4, 2, 1, 1, NOW(), NOW()),  -- Zgjedhore
('Analiza e të Dhënave', 4, 2, 1, 1, NOW(), NOW());  -- Zgjedhore

-- VITI III (Semestri 5 dhe 6)
-- Semestri 5
INSERT INTO lendet (emriLendes, semestri, viti, isZgjedhore, profesorId, createdAt, updatedAt) VALUES
('Sistemet e Distribuuara', 5, 3, 0, 1, NOW(), NOW()),
('Cloud Computing', 5, 3, 1, 1, NOW(), NOW()),  -- Zgjedhore
('DevOps dhe CI/CD', 5, 3, 0, 1, NOW(), NOW());

-- Semestri 6
INSERT INTO lendet (emriLendes, semestri, viti, isZgjedhore, profesorId, createdAt, updatedAt) VALUES
('Aplikacione Mobile', 6, 3, 0, 1, NOW(), NOW()),
('Arkitektura e Softuerit', 6, 3, 1, 1, NOW(), NOW()),  -- Zgjedhore
('Projekt Diplome', 6, 3, 0, 1, NOW(), NOW());

-- Verify data inserted
SELECT 
  l.id,
  l.emriLendes,
  l.viti,
  l.semestri,
  l.isZgjedhore,
  l.profesorId,
  CONCAT(p.emri, ' ', p.mbiemri) as profesori
FROM lendet l
LEFT JOIN profesoret p ON l.profesorId = p.id
WHERE l.profesorId = 1
ORDER BY l.viti, l.semestri, l.emriLendes;
