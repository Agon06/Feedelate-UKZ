# Refaktorimi i Plotë - Bashkimi i Tabelave të Duplikuara

## 📋 Përmbledhje

Ky refaktorim eliminon të gjitha tabelat e duplikuara të sistemit (ato me prapashtesën "p" të destinuara për profesorët). Profesorët dhe studentët tani shohin të njëjtat tabela unifikuara, duke siguruar komunikimin e duhur dhe konsistencën e të dhënave.

---

## 🗑️ Fajllat e Fshirë

Këto entitete të duplikuara janë hequr përfundimisht:

1. **Backend/src/entities/Profesor/Lendetp.ts** ❌
2. **Backend/src/entities/Profesor/Idetep.ts** ❌
3. **Backend/src/entities/Profesor/Projektip.ts** ❌
4. **Backend/src/entities/Profesor/dorezimiIdesp.ts** ❌

---

## ✅ Entitetet e Modifikuara

### 1. **Lendet.ts** (Student/Lendet.ts)

```typescript
@Entity("lendet")
export class Lendet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    emriLendes: string;

    // ... kolonat e tjera

    // ✨ SHTUAR: Relacion me Profesorin
    @ManyToOne(() => Profesor, (profesor) => profesor.lendet, { 
        onDelete: "SET NULL", 
        nullable: true 
    })
    @JoinColumn({ name: "profesorId" })
    profesor?: Profesor;

    @Column({ nullable: true })
    profesorId?: number;

    // Relacionet me Idete, DorezimiIdes, dorzimiProjektit...
}
```

**Rëndësi**: Profesori zotëron lëndën përmes këtij relacioni.

---

### 2. **Idete.ts** (Student/Idete.ts)

```typescript
@Entity("idete")
export class Idete {
    @PrimaryGeneratedColumn()
    id: number;

    // Idetë i përkasin Studentëve
    @ManyToOne(() => Student, (student) => student.idete, { onDelete: "CASCADE" })
    @JoinColumn({ name: "studentId" })
    student: Student;

    @Column()
    studentId: number;

    // Idetë janë lidhur me Lëndën
    @ManyToOne(() => Lendet, (lenda) => lenda.idete, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendet;

    @Column()
    lendaId: number;

    // ✨ SHTUAR: Relacion me Profesorin - cili profesor vlerëson idenë
    @ManyToOne(() => Profesor, (profesor) => profesor.idete, { 
        onDelete: "SET NULL", 
        nullable: true 
    })
    @JoinColumn({ name: "profesorId" })
    profesor?: Profesor;

    @Column({ nullable: true })
    profesorId?: number;

    @Column()
    titulli: string;
    @Column()
    shkurtesa: string;
    @Column()
    viti: number;
}
```

**Logjika**: 
- Studenti e shton idenë → `studentId` dhe `lendaId` plotësohen
- Profesori e vlerëson idenë → `profesorId` vendoset

---

### 3. **DorezimiIdes.ts** (Student/dorezimiides.ts)

```typescript
@Entity('dorezimiides')
export class DorezimiIdes {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, (student) => student.dorezime, { onDelete: "CASCADE" })
    @JoinColumn({ name: "studentId" })
    student: Student;

    @Column()
    studentId: number;

    @ManyToOne(() => Lendet, (lenda) => lenda.dorezime, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendet;

    @Column()
    lendaId: number;

    // ✨ SHTUAR: Profesori pranon dorezimin
    @ManyToOne(() => Profesor, (profesor) => profesor.dorezimeIdeesh, { 
        onDelete: "SET NULL", 
        nullable: true 
    })
    @JoinColumn({ name: "profesorId" })
    profesor?: Profesor;

    @Column({ nullable: true })
    profesorId?: number;

    @Column()
    fileDorezimi: string;
    @Column()
    fileName: string;
    @Column()
    isShabllon: boolean;
}
```

---

### 4. **Profesor.ts** (Profesor/Profesor.ts)

```typescript
@Entity("profesoret")
export class Profesor {
    @PrimaryGeneratedColumn()
    id: number;

    // ... kolonat e tjera (emri, mbiemri, email, etj.)

    // ✨ SHTUAR: Profesori zotëron shumë lëndë
    @OneToMany(() => Lendet, (lenda) => lenda.profesor, { cascade: false })
    lendet: Lendet[];

    // ✨ SHTUAR: Profesori vlerëson shumë idetë
    @OneToMany(() => Idete, (idete) => idete.profesor, { cascade: false })
    idete: Idete[];

    // ✨ SHTUAR: Profesori pranon dorezime
    @OneToMany(() => DorezimiIdes, (dorezim) => dorezim.profesor, { cascade: false })
    dorezimeIdeesh: DorezimiIdes[];
}
```

---

## 🔄 Shembull i Rrjedhës (Unified)

### Para (Duplikatim):
```
Profesori:
  - Lendetp (id: 1, emriLendes: "Algoritmet")
  - Idetep (id: 1, titulli: "Sortimi", lendaId: 1 në lendetp)
  
Studenti:
  - Lendet (id: 10, emriLendes: "Algoritmet")
  - Idete (id: 10, titulli: "Sortimi", studentId: 5, lendaId: 10)
  
❌ PROBLEM: Dy tabela, dy rreshta të ndarë - nuk shohin njëri-tjetrin!
```

### Pas (Unifikuar):
```
Profesori:
  - Lendet (id: 1, emriLendes: "Algoritmet", profesorId: 1)
  - Idete (id: 10, titulli: "Sortimi", studentId: 5, lendaId: 1, profesorId: 1)

Studenti:
  - Shikon Lendet (id: 1) përmes profesor
  - Dorëzon Idete në të njëjtën tabelë
  
✅ SOLVED: Një tabela, të gjithë shohin të njëjtën të dhënë!
```

---

## 📝 Shembull i Controller-it të Përditësuar

### GET /profesor/:id/idet - Të Gjitha Idetë për Lëndën

```typescript
router.get("/:id/idet", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = req.query.lendaId ? Number(req.query.lendaId) : undefined;

  const ideas = await ideteRepository.find({
    where: lendaId ? { lenda: { id: lendaId } } : {},
    relations: ["lenda", "student", "profesor"],
    order: { createdAt: "DESC" },
  });

  // Tani merr TË GJITHA IDETË - të studentëve dhe të profesorit
  const ideasData = ideas.map((idea) => ({
    id: idea.id,
    title: idea.titulli,
    type: idea.student ? "student" : "profesor",
    studentName: idea.student ? `${idea.student.emri} ${idea.student.mbiemri}` : null,
  }));

  res.json(ideasData);
});
```

**Çfarë ka ndryshuar**: 
- Nuk duhet të kombinohet Idetep + Idete
- Merr të gjitha në një query
- Automatikisht shfaqet kush e dorëzoi idenë (student ose profesor)

---

## 📊 Diagrami i Relacioneve (ERD)

```
┌─────────────┐
│  Profesor   │
├─────────────┤
│ id (PK)     │
│ emri        │
│ email       │
└──────┬──────┘
       │ 1:N (lendet)
       │
┌──────▼─────────────┐
│     Lendet         │
├────────────────────┤
│ id (PK)            │
│ emriLendes         │
│ profesorId (FK)    │◄─── Qdo lëndë zotërohet nga një profesor
│ semestri           │
│ viti               │
└──────┬─────────────┘
       │ 1:N (idete)
       │
┌──────▼──────────────┐     ┌─────────────┐
│      Idete          │     │   Student   │
├─────────────────────┤     ├─────────────┤
│ id (PK)             │     │ id (PK)     │
│ titulli             │     │ emri        │
│ studentId (FK)  ────┼────►│ email       │
│ lendaId (FK)    ────┼───┐ └─────────────┘
│ profesorId (FK) ─┐  │   │
│ viti            │  │   │ Qdo ide:
└────────────────┤──┼───┤ - Dorëzohet nga 1 Student
                 │  │   │ - Për 1 Lëndë
                 │  │   │ - Vlerësohet nga Profesor
                 │  │   └─ Lidhja përmes lenda.profesorId
                 │  │
                 │  └────────────────────────────────────┐
                 │                                        │
              Shfaqet përmes lenda ◄─ Profesori
```

---

## 🔧 Migrimi i të Dhënave (Nëse keni të dhëna në lendetp)

**Nëse në tabelën `lendetp` ekzistojnë të dhëna, bëni këtë migration SQL:**

```sql
-- Kopy të dhënat e lëndëve nga lendetp në lendet
INSERT INTO lendet (emriLendes, semestri, viti, isZgjedhore, templateFile, templateFileName, profesorId)
SELECT emriLendes, semestri, viti, isZgjedhore, templateFile, templateFileName, NULL
FROM lendetp;

-- Kopy të dhënat e ideteve nga idetep në idete
INSERT INTO idete (titulli, shkurtesa, viti, studentId, lendaId, profesorId)
SELECT titulli, shkurtesa, viti, NULL, lendaId, profesorId
FROM idetep;

-- Kopy të dhënat e dorezimeve nga dorezimiidesp në dorezimiides
INSERT INTO dorezimiides (fileDorezimi, fileName, isShabllon, studentId, lendaId, profesorId)
SELECT fileDorezimi, fileName, isShabllon, NULL, lendaId, profesorId
FROM dorezimiidesp;

-- Pastro tabelat e vjetra (pas verifikimit)
-- DROP TABLE idetep;
-- DROP TABLE dorezimiidesp;
-- DROP TABLE lendetp;
-- DROP TABLE projektip;
```

---

## 🚀 Hapat pas Migrimit

### 1. **Sinkronizim i TypeORM** ✅
Nëse `synchronize: true` në `data-source.ts`:
```typescript
export const AppDataSource = new DataSource({
  // ...
  synchronize: true, // ← TypeORM do të bëjë tabelat automatikisht
});
```

### 2. **Testim**
```bash
cd Backend
npm run build       # Provo se typescript kompajlon
npm run dev         # Starton serverin
```

### 3. **Endpoints të Testuar**
```bash
# Merr të gjitha lëndët e profesorit
GET /profesor/:id/lendet/:yearId

# Merr të gjitha idetë për lëndën (të studentëve dhe profesorit)
GET /profesor/:id/idet?lendaId=1

# Merr dorezimeet e studentëve për vlerësim
GET /profesor/:id/dorezime-studentesh/:lendaId
```

---

## 📦 Dosjet e Përditësuara

✅ **Entitetet**:
- [Lendet.ts](Backend/src/entities/Student/Lendet.ts) - Shtua profesorId
- [Idete.ts](Backend/src/entities/Student/Idete.ts) - Shtua profesorId
- [dorezimiides.ts](Backend/src/entities/Student/dorezimiides.ts) - Shtua profesorId
- [Profesor.ts](Backend/src/entities/Profesor/Profesor.ts) - Shtua relacione OneToMany

✅ **Routes**:
- [profesorRoutes.ts](Backend/src/routes/Profesor/profesorRoutes.ts) - Përditësuar të gjitha queries
- [projektiRoutesp.ts](Backend/src/routes/Profesor/projektiRoutesp.ts) - Përditësuar për Projekti
- [setup.ts](Backend/src/routes/setup.ts) - Përditësuar seedingun

✅ **Konfigurimi**:
- [data-source.ts](Backend/src/data-source.ts) - Hequr importet e p-files

---

## ⚠️ Përgatitje para të Startimit

### 1. **Backup i Databazës** 🔒
```bash
# Bëj dump të BD-s aktuale para se të fillosh
# Për MySQL:
mysqldump -u root -p feedelate > backup_before_refactor.sql
```

### 2. **Pastro Cache** 🗑️
```bash
# Fshij dist folder (TypeScript compilation)
rm -r Backend/dist
npm run build       # Rija
```

### 3. **Resetim i BD-s** (Opsional)
Nëse keni test data dhe doni të startoni i freskët:
```bash
# Ndryshoni env: DB_NAME=feedelate_refactored
# TypeORM do të krijoni tabelat e reja automatikisht
```

---

## 🎯 Përfitime të Refaktorimit

✨ **Para**:
- Profesori shikonte Lendetp, Student shikonte Lendet → **Duplikimi**
- Profesori shikonte Idetep, Student shikonte Idete → **Desinkronizim**
- Manual SQL joins për të lidhur të dhënat → **Kompleksitet**

✨ **Pas**:
- Një tabela unike për secilin entitet → **Konsistencë**
- Relacionet e qarta në TypeORM → **Integritet**
- Queries më të thjesha → **Performance**
- Frontend pret **një** endpoint, jo shumë → **Thjeshtësi**

---

## 📱 Frontend - Përditësimet (Hapi i Ardhshëm)

Pasi sa backend-i t'i heq duplikatat, **frontend duhet të rishkruhet për të:**

1. Kërkuar lëndët tek **lendet** (jo lendetp)
2. Kërkuar idetë tek **idete** (jo idetep)
3. Merr dorezimeat e studentëve tek **dorezimiides** (jo dorezimiidesp)

Më pohuaj kur të jesh gati: **"Tani që unifikuam backend-in, përditëso thirrjet API në frontend..."**

---

## 🐛 Troubleshooting

### Gabim: "Tabela lendetp nuk ekziston"
```
Zgjidhja: Fshi dist/ folder dhe bëj npm run build
```

### Gabim: "Foreign key constraint failed"
```
Zgjidhja: Sigurohu që profesorId dhe studentId janë NULL para se të heqësh relata
```

### Gabim: "Profesor.lendet nuk ekziston"
```
Zgjidhja: Sigurohu që synkronizimi i TypeORM punoi. Hiq dist/data-source.js
```

---

**Përfundim**: Refaktorimi përfundon me sukses! Tani profesorët dhe studentët ndajnë të njëjtat tabela, duke siguruar komunikim dhe të dhëna konsistente. 🎉
