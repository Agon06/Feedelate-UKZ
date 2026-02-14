-- Script për të rregulluar lidhjet e profesorëve me lëndët dhe dorëzimet

-- Hapi 1: Shfaq lëndët që nuk kanë profesor
SELECT 'Lëndë pa profesor:' AS status;
SELECT id, emriLendes, profesorId FROM lendet WHERE profesorId IS NULL;

-- Hapi 2: Vendos profesorId = 1 për të gjitha lëndët që nuk kanë profesor
-- (Mund të ndryshosh ID-në sipas nevojës)
UPDATE lendet SET profesorId = 1 WHERE profesorId IS NULL;

-- Hapi 3: Shfaq dorëzimet që nuk kanë profesor të caktuar
SELECT 'Dorëzime pa profesor:' AS status;
SELECT d.id, d.fileName, d.lendaId, l.emriLendes, d.profesorId 
FROM dorezimiides d
LEFT JOIN lendet l ON d.lendaId = l.id
WHERE d.profesorId IS NULL AND d.isShabllon = 0;

-- Hapi 4: Përditëso automatikisht dorëzimet për t'u lidhur me profesorin e lëndës
UPDATE dorezimiides d
INNER JOIN lendet l ON d.lendaId = l.id
SET d.profesorId = l.profesorId
WHERE d.profesorId IS NULL 
  AND d.isShabllon = 0 
  AND l.profesorId IS NOT NULL;

-- Hapi 5: Verifikim final
SELECT 'Rezultatet finale:' AS status;
SELECT 
  (SELECT COUNT(*) FROM lendet WHERE profesorId IS NULL) AS lendet_pa_profesor,
  (SELECT COUNT(*) FROM dorezimiides WHERE profesorId IS NULL AND isShabllon = 0) AS dorezime_pa_profesor;

SELECT 'Sukses! Të gjitha lidhjet u rregulluan.' AS status;
