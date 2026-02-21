# SQL Migration Guide - Migrimi i të Dhënave nga Tabelat e Duplikuara

## ⚠️ RËNDËSI: Lexoji këtë para se të startosh serverim!

Ky guide shpjego si të migroji të dhënat nga tabelat e vjetra (lendetp, idetep, etc.) në tabelat e reja të unifikuara (lendet, idete, dorezimiides).

---

## 🔍 HAPI 1: Kontrolloj nëse ka të dhëna në tabelat e vjetra

Ekzekuto këto queries për të parë sa të dhëna ka në tabelat e vjetra:

```sql
-- Kontrolloji lendetp
SELECT COUNT(*) as lendetp_count FROM lendetp;

-- Kontrolloji idetep
SELECT COUNT(*) as idetep_count FROM idetep;

-- Kontrolloji dorezimiidesp
SELECT COUNT(*) as dorezimiidesp_count FROM dorezimiidesp;

-- Kontrolloji projektip
SELECT COUNT(*) as projektip_count FROM projektip;
```

### Nëse të gjithë contët janë 0:
✅ Nuk ke të dhëna të rëndësishme - mund të shkosh direkt në **HAPI 3**

### Nëse ka të dhëna:
⚠️ Duhet të bësh migrimin - shko në **HAPI 2**

---

## 💾 HAPI 2: Backup i BD-s Përpara Migrimit

**RËNDËSI KRITIKE**: Bëj backup përpara se të heqësh të dhëna!

```sql
-- Eksporto lendetp
CREATE BACKUP TABLE lendetp_backup AS SELECT * FROM lendetp;

-- Eksporto idetep
CREATE BACKUP TABLE idetep_backup AS SELECT * FROM idetep;

-- Eksporto dorezimiidesp
CREATE BACKUP TABLE dorezimiidesp_backup AS SELECT * FROM dorezimiidesp;

-- Eksporto projektip
CREATE BACKUP TABLE projektip_backup AS SELECT * FROM projektip;
```

**Ose përmes terminal-it**:
```bash
# Për MySQL
mysqldump -u root -p feedelate > backup_$(date +%Y%m%d_%H%M%S).sql

# Ruaj file-in në një vend të sigurt!
```

---

## 🔄 HAPI 3: Migrimi i të Dhënave

### 3.1 Migrimi i Lendetp → Lendet

```sql
-- Hiq null values dhe shto të gjitha lëndët
INSERT INTO lendet (emriLendes, semestri, viti, isZgjedhore, templateFile, templateFileName, profesorId, createdAt, updatedAt)
SELECT 
  emriLendes,
  semestri,
  viti,
  isZgjedhore,
  templateFile,
  templateFileName,
  NULL as profesorId,  -- Profesor nuk do të ketë asignim
  createdAt,
  updatedAt
FROM lendetp
WHERE emriLendes IS NOT NULL;  -- Sigurohu që emri ekziston
```

**Shënim**: Nëse do të lidhësh lëndën me profesorin:
```sql
-- Nëse ke informacion se cili profesor zotëron cilën lëndë
UPDATE lendet l
SET profesorId = (SELECT id FROM profesoret WHERE email = 'profesor@uni.net')
WHERE emriLendes = 'Algoritmet' AND viti = 1;
```

---

### 3.2 Migrimi i Idetep → Idete

```sql
-- Kopjo idetë e profesorit
INSERT INTO idete (titulli, shkurtesa, viti, studentId, lendaId, profesorId, createdAt, updatedAt)
SELECT 
  titulli,
  shkurtesa,
  viti,
  NULL as studentId,  -- Idetë e profesorit nuk kanë student
  lendaId,
  profesorId,
  createdAt,
  updatedAt
FROM idetep
WHERE titulli IS NOT NULL;  -- Sigurohu që titulli ekziston
```

---

### 3.3 Migrimi i Dorezimiidesp → Dorezimiides

```sql
-- Kopjo dorezimeat e profesorit
INSERT INTO dorezimiides (fileDorezimi, fileName, isShabllon, studentId, lendaId, profesorId, createdAt)
SELECT 
  fileDorezimi,
  fileName,
  isShabllon,
  NULL as studentId,  -- Dorezimeat e profesorit nuk kanë student
  lendaId,
  profesorId,
  createdAt
FROM dorezimiidesp
WHERE fileDorezimi IS NOT NULL;  -- Sigurohu që file path ekziston
```

---

### 3.4 Migrimi i Projektip → Projekti

```sql
-- Kopjo projektet e profesorit
-- SHËNIM: Projekti ka studentId, jo profesorId direkt
-- Nëse dëshiron të lidhësh me profesor, duhet të përditësosh logjikën

INSERT INTO projekti (emriProjekti, pershkrimiProjekti, deaAdline, studentId, lendaId, createdAt, updatedAt)
SELECT 
  emriProjekti,
  pershkrimiProjekti,
  deaAdline,
  NULL as studentId,  -- Projektet e profesorit nuk kanë student të caktuar
  lendaId,
  createdAt,
  updatedAt
FROM projektip
WHERE emriProjekti IS NOT NULL;  -- Sigurohu që emri ekziston
```

---

## ✅ HAPI 4: Verifikimi i Migrimit

Pasi të përfundojë migrimi, verifiko të dhënat:

```sql
-- Kontrollo lendet
SELECT COUNT(*) as total, COUNT(DISTINCT profesorId) as with_profesor FROM lendet;

-- Kontrollo idetë
SELECT COUNT(*) as total, COUNT(profesorId) as profesor_ideas, COUNT(studentId) as student_ideas FROM idete;

-- Kontrollo dorezimeat
SELECT COUNT(*) as total, COUNT(profesorId) as profesor_submissions, isShabllon, COUNT(*) FROM dorezimiides GROUP BY isShabllon;

-- Kontrollo projektet
SELECT COUNT(*) as total FROM projekti;
```

**Pritshmërit**:
```
lendet:       100 total (për shembull)
idete:        ~50 profesor ideas, ~200 student ideas
dorezimiides: ~20 templates, ~150 submissions
projekti:     ~30 total
```

---

## 🗑️ HAPI 5: Pastrimi i Tabelave të Vjetra

⚠️ **RËNDËSI**: Bëj BACKUP përpara se të fshish!

Pasi të sigurohen të dhënat në tabelat e reja, mund të fshish të vjetra:

```sql
-- Hiq constraints/foreign keys (nëse ekziston)
ALTER TABLE idetep DROP FOREIGN KEY IF EXISTS idetep_ibfk_2;
ALTER TABLE dorezimiidesp DROP FOREIGN KEY IF EXISTS dorezimiidesp_ibfk_2;

-- Fshij tabelat e vjetra
DROP TABLE IF EXISTS idetep;
DROP TABLE IF EXISTS dorezimiidesp;
DROP TABLE IF EXISTS lendetp;
DROP TABLE IF EXISTS projektip;

-- Verifikimi - tabelat e vjetra nuk duhet të jenë në listë
SHOW TABLES LIKE '%p%';  -- Nuk duhet të ketë rezultate
```

---

## 🔙 Nëse Diçka Shkon Keq - Recovery

### Restaurim nga Backup

Nëse gëzoji ndonjë problem, mund të restaurosh backup:

```sql
-- Nëse ke backup tables
DROP TABLE lendet;
DROP TABLE idete;
DROP TABLE dorezimiides;
DROP TABLE projekti;

RENAME TABLE lendetp_backup TO lendet;
RENAME TABLE idetep_backup TO idete;
RENAME TABLE dorezimiidesp_backup TO dorezimiides;
RENAME TABLE projektip_backup TO projekti;
```

---

## 📋 Cheklist i Migrimit

- [ ] Bëri backup të BD-s (`mysqldump`)
- [ ] Ekzekuto HAPI 3 - Migrimi (lexo queries përpara, o jo blakl!)
- [ ] Verifikim - Kontrolloji të dhënat me HAPI 4
- [ ] Konfirmo që nuk ka të dhëna të humbura
- [ ] Fshij tabelat e vjetra me HAPI 5
- [ ] Testo aplikacionin - sigurohu se funksionon siç pritet
- [ ] Dokumento - shënoni se migrimi u përfundua

---

## 🔐 TypeORM Synchronization

Pas migrimit, TypeORM do të sinkronizojë skemën:

```typescript
// Backend/src/data-source.ts
export const AppDataSource = new DataSource({
  // ...
  synchronize: true, // ← Sinkronizim automatik
  logging: false,
  entities: [
    // ... (pa Lendetp, Idetep, etc.)
  ],
});
```

**Çfarë ndodh**:
1. TypeORM shikon entitetet në entities array
2. Shikon BD-në aktuale
3. Krijon/përditëson tabelat sipas nevojës
4. Nuk fshish të dhënat ekzistuese

---

## 🧪 Testuese pas Migrimit

```bash
# Starton serverin
npm run dev

# Testo endpoints
curl http://localhost:5000/api/profesor/1/dashboard
curl http://localhost:5000/api/profesor/1/lendet/1
curl http://localhost:5000/api/profesor/1/idet?lendaId=1
```

---

## 📊 Shembull i Migrimit Të Plotë

### Përpara
```
BD: feedelate
Tables:
  - lendet (10 rreshta - studentet)
  - lendetp (50 rreshta - profesorët)
  - idete (100 rreshta - students)
  - idetep (80 rreshta - professors)
```

### Pas
```
BD: feedelate
Tables:
  - lendet (60 rreshta - të gjitha lëndët)
  - idete (180 rreshta - të gjitha idetë)
  - lendetp ❌ (fshirë)
  - idetep ❌ (fshirë)
```

---

## 🛠️ Troubleshooting

### Problem: "Foreign key constraint failed"
```sql
-- Zgjidhja: Çaktivizoni foreign key checks temp.
SET FOREIGN_KEY_CHECKS = 0;
-- ... ekzekuto migrimin ...
SET FOREIGN_KEY_CHECKS = 1;
```

### Problem: "Duplicate entry for key"
```sql
-- Zgjidhja: Kontrollo nëse të dhënat ekzistojnë
SELECT * FROM lendet WHERE id = 1;
DELETE FROM lendet WHERE id = 1;
-- pastaj ekzekuto migrimin përnjë herë
```

### Problem: "Access denied"
```bash
# Sigurohu që ke kredenciale të duhura
mysql -u root -p feedelate < migration.sql
```

---

## ✅ Përfundim

Pas migrimit, BD-ja juaj do të jetë:
- ✅ Konsoliduar (pa duplikate)
- ✅ Në sinkronizim me TypeORM
- ✅ Gati për aplikacionin e ri

**Kontrolloni REFACTORING_SUMMARY.md për më shumë detaje!**
