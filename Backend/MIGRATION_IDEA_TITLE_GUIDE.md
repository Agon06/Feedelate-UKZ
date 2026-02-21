# Migration Guide: Shto ideaTitle kolone

## Hapat për të aplikuar migration:

### 1. Hap HeidiSQL ose MySQL Workbench
   - Lidhu me databazën tuaj

### 2. Ekzekuto SQL command-in:
   ```sql
   ALTER TABLE lendet
   ADD COLUMN ideaTitle VARCHAR(255) NULL COMMENT 'Titulli custom i afatit të dorëzimit të idesë';
   ```

### 3. Verifiko që kolona është shtuar:
   ```sql
   DESCRIBE lendet;
   ```

## Ose përmes command line:

Nëse ke `mysql` në PATH, ekzekuto:

```bash
mysql -u root -p < Backend/migration_add_idea_title.sql
```

## Ose automatikisht kur të ekzekutosh backend:

TypeORM do të sinkronizojë automatikisht entitetin me databazën nëse ke `synchronize: true` në config.

---

**SHËNIM**: Pas ekzekutimit të migration, restarto backend dhe frontend për të aplikuar ndryshimet.
