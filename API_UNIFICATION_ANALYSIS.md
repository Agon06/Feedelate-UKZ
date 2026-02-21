# 📊 API Unification Analysis Report
## Analiza e Plotë e Endpoint-eve dhe Logjikës së Biznesit

**Data e Krijimit**: 21 Janar 2026  
**Qëllimi**: Identifikimi i duplikateve dhe mospërputhjeve në endpoint-e dhe unifikimi i logjikës

---

## 🎯 Executive Summary

Pas analizës së thellë të backend-it dhe frontend-it, kam identifikuar **disa mospërputhje kritike** midis modulit të studentit dhe profesorit. Edhe pse tabelat e database-it janë unifikuar në nivel TypeORM (Lendet, Idete, DorezimiIdes), **endpoint-et dhe thirrjet në frontend mbeten të ndara dhe jo të optimizuara**.

### ✅ Çfarë Funksionon Mirë
- ✅ Backend-i përdor tabela të unifikuara (Lendet, Idete, DorezimiIdes)
- ✅ Të dy moduli (Student/Profesor) lexojnë nga të njëjtat tabela
- ✅ Relacionet TypeORM janë të sakta

### ❌ Çfarë Duhet Përmirësuar
- ❌ **Endpoint-et janë paralele**: `/studentet/:id/...` vs `/profesoret/:id/...`
- ❌ **Mungon Role-Based Access Control (RBAC)** - nuk ekziston një endpoint i vetëm `/api/courses`
- ❌ **Frontend-i bën thirrje të ndara** për të njëjtin burim të të dhënave
- ❌ **Profesori nuk shikon idetë e studentëve** në mënyrë optimale (filtron me JavaScript në vend që SQL)
- ❌ **Feedback-u nuk është i implementuar** në backend (vetëm mock data në frontend)

---

## 📍 PART 1: Backend Endpoint Audit

### Student Endpoints (studentRoutes.ts)
**Base URL**: `/api/studentet/:id`

| Endpoint | Method | Qëllimi | Tabela e Lexuar | Rreshti |
|----------|--------|---------|-----------------|---------|
| `/:id/dashboard` | GET | Dashboard overview | Lendet | 124 |
| `/:id/lendet/:yearId` | GET | Lëndët sipas vitit | Lendet | 182 |
| `/:id/idet` | GET | Idetë e studentit | **Idete** (unified) | 249 |
| `/:id/idet` | POST | Krijo ide të re | **Idete** (unified) | 295 |
| `/:id/idet/:ideaId` | PUT | Përditëso ide | **Idete** (unified) | 345 |
| `/:id/idet/:ideaId` | DELETE | Fshi ide | **Idete** (unified) | 402 |
| `/:id/dorezime` | POST | Ngarko dorezim | **DorezimiIdes** (unified) | 427 |
| `/:id/dorezime/shabllon` | GET | Merr template | **DorezimiIdes** (unified) | 501 |
| `/:id/dorezime` | GET | Merr dorezimin | **DorezimiIdes** (unified) | 550 |
| `/:id/dorezime/:dorezimId` | DELETE | Fshi dorezim | **DorezimiIdes** (unified) | 612 |
| `/:id/projekti/:lendaId` | GET | Shiko projektin | Projekti | 730 |
| `/:id/projekti/dorezo` | POST | Dorezo projekt | dorzimiProjektit | 770 |
| `/:id/projekti/:lendaId` | DELETE | Fshi projekt | dorzimiProjektit | 834 |
| `/:id/projekti/:lendaId/download` | GET | Shkarko projekt | dorzimiProjektit | 869 |
| `/:id/projekti/:lendaId/template` | GET | Merr template | Lendet (templateFile) | 901 |
| `/:id/projekti/:lendaId/template/download` | GET | Shkarko template | Lendet (templateFile) | 932 |

### Profesor Endpoints (profesorRoutes.ts)
**Base URL**: `/api/profesoret/:id`

| Endpoint | Method | Qëllimi | Tabela e Lexuar | Rreshti |
|----------|--------|---------|-----------------|---------|
| `/:id/dashboard` | GET | Dashboard overview | **Lendet** (unified) | 90 |
| `/:id/lendet/:yearId` | GET | Lëndët sipas vitit | **Lendet** (unified) | 152 |
| `/:id/idet` | GET | Idetë e lëndës | **Idete** (unified) | 223 |
| `/:id/idet` | POST | Krijo ide shabllon | **Idete** (unified) | 271 |
| `/:id/dorezime` | POST | Ngarko dorezim | **DorezimiIdes** (unified) | 322 |
| `/:id/dorezime/shabllon` | GET | Merr template | **DorezimiIdes** (unified) | 396 |
| `/:id/dorezime` | GET | Merr dorezimin e prof | **DorezimiIdes** (unified) | 445 |
| `/:id/dorezime-studentesh/:lendaId` | GET | **Idetë e studentëve** | **DorezimiIdes** (unified) | 503 |
| `/:id/lendet/:lendaId/template` | POST | Ngarko template | Lendet (templateFile) | 628 |
| `/:id/lendet/:lendaId/template` | GET | Merr template info | Lendet (templateFile) | 677 |
| `/:id/lendet/:lendaId/template` | DELETE | Fshi template | Lendet (templateFile) | 707 |

### Projekt Endpoints (projektiRoutesp.ts)
**Base URL**: `/api/projektip/:profesorId`

| Endpoint | Method | Qëllimi | Tabela e Lexuar | Rreshti |
|----------|--------|---------|-----------------|---------|
| `/:profesorId` | GET | Lista e projekteve | **Projekti** (unified) | 13 |
| `/:profesorId/:id` | GET | Detajet e projektit | **Projekti** (unified) | 32 |
| `/:profesorId` | POST | Krijo projekt | **Projekti** (unified) | 50 |
| `/:profesorId/:id` | PUT | Përditëso projekt | **Projekti** (unified) | 83 |
| `/:profesorId/:id` | DELETE | Fshi projekt | **Projekti** (unified) | 120 |

---

## 📱 PART 2: Frontend API Calls Audit

### Student Frontend (studentApi.js)

**File**: `Frontend/src/services/studentApi.js`

| Funksioni | URL Thirrur | Metoda | Rreshti | Përdorimi |
|-----------|-------------|--------|---------|-----------|
| `getStudentDashboard` | `/studentet/${studentId}/dashboard` | GET | 30 | StudentDashboard.jsx |
| `getStudentYearData` | `/studentet/${studentId}/lendet/${yearId}` | GET | 33 | StudentLendet.jsx |
| `getStudentIdeas` | `/studentet/${studentId}/idet` | GET | 36-43 | Ide.jsx |
| `createStudentIdea` | `/studentet/${studentId}/idet` | POST | 45-51 | Ide.jsx |
| `updateStudentIdea` | `/studentet/${studentId}/idet/${ideaId}` | PUT | 53-59 | Ide.jsx |
| `deleteStudentIdea` | `/studentet/${studentId}/idet/${ideaId}` | DELETE | 61-64 | Ide.jsx |
| `uploadStudentDorezim` | `/studentet/${studentId}/dorezime` | POST | 77 | dorezimi.jsx |
| `getStudentIdeaSubmission` | `/studentet/${studentId}/dorezime?lendaId=...` | GET | 85 | dorezimi.jsx |
| `getStudentTemplate` | `/studentet/${studentId}/dorezime/shabllon?lendaId=...` | GET | 88 | dorezimi.jsx |
| `deleteStudentDorezim` | `/studentet/${studentId}/dorezime/${dorezimId}` | DELETE | 131 | dorezimi.jsx |

### Profesor Frontend (profesorApi.js)

**File**: `Frontend/src/services/profesorApi.js`

| Funksioni | URL Thirrur | Metoda | Rreshti | Përdorimi |
|-----------|-------------|--------|---------|-----------|
| `getProfesorDashboard` | `/profesoret/${profesorId}/dashboard` | GET | 30 | ProfesorDashboard.jsx |
| `getProfesorYearData` | `/profesoret/${profesorId}/lendet/${yearId}` | GET | 33-51 | lendetp.jsx |
| `getProfesorIdeas` | `/profesoret/${profesorId}/idet` | GET | 53-88 | idetep.jsx |
| `createProfesorIdea` | `/profesoret/${profesorId}/idet` | POST | 90-96 | idetep.jsx |
| `uploadProfesorDorezim` | `/profesoret/${profesorId}/dorezime` | POST | 100-108 | dorezimip.jsx |
| `getProfesorIdeaSubmission` | `/profesoret/${profesorId}/dorezime?lendaId=...` | GET | 110 | dorezimip.jsx |
| `getProfesorTemplate` | `/profesoret/${profesorId}/dorezime/shabllon?lendaId=...` | GET | 113 | dorezimip.jsx |
| `getStudentSubmissions` | `/profesoret/${profesorId}/dorezime-studentesh/${lendaId}` | GET | 115-135 | **dorezimet-studentesh.jsx** |
| `uploadLendaTemplate` | `/profesoret/${profesorId}/lendet/${lendaId}/template` | POST | 167 | lendetp.jsx |
| `getLendaTemplateInfo` | `/profesoret/${profesorId}/lendet/${lendaId}/template` | GET | 176 | lendetp.jsx |
| `deleteLendaTemplate` | `/profesoret/${profesorId}/lendet/${lendaId}/template` | DELETE | 180 | lendetp.jsx |

### ⚠️ Projekt API (projektiApi.js) - PROBLEMATIKE!

**File**: `Frontend/src/services/projektiApi.js`

```javascript
// ❌ GABIM: Po thërret `/projektip/${profesorId}` në vend të `/api/studentet/${studentId}/projekti`
export const getProfesorProjects = (profesorId) =>
  request(`/projektip/${profesorId}`);  // Line 143

// ❌ GABIM: Endpoint-i `/projektip/` NUK EKZISTON në index.ts!
// Backend-i ka vetëm: /api/profesoret/:id/... dhe /api/studentet/:id/...
```

**Problemi**: Frontend-i thërret `/projektip/${profesorId}` por backend-i nuk e ka këtë route në `index.ts`. Route-i ekziston në `projektiRoutesp.ts` por **nuk është montuar në aplikacion**!

---

## 🔍 PART 3: Data Flow Analysis (Flux i të Dhënave)

### 3.1 Dorezimi i Idesë (Student → Profesor)

#### ✅ Flow Aktual (Funksionon por jo optimal)

```
1. Studenti krijon ide:
   POST /api/studentet/{studentId}/idet
   Body: { lendaId, titulli, shkurtesa }
   ↓
   Backend: ideaRepository.create({ student, lenda, ... })
   ↓
   Ruhet në tabelën: Idete (unified)
   Kolona: studentId = {studentId}, profesorId = NULL

2. Studenti ngarkon file dorezimi:
   POST /api/studentet/{studentId}/dorezime
   FormData: { file, lendaId }
   ↓
   Backend: dorezimRepository.create({ student, lenda, isShabllon: false })
   ↓
   Ruhet në tabelën: DorezimiIdes (unified)
   Kolona: studentId = {studentId}, profesorId = NULL, isShabllon = false

3. Profesori shikon lista e ideve:
   GET /api/profesoret/{profesorId}/idet?lendaId={lendaId}
   ↓
   Backend Query:
   ```typescript
   const ideas = await ideteRepository.find({
     where: lendaId ? { lenda: { id: lendaId } } : {},
     relations: ["lenda", "student", "profesor"]
   });
   // ✅ Merr TË GJITHA idetë (student + profesor) për lëndën
   ```
   ↓
   Response: Lista me { type: "student" | "profesor", studentName, ... }

4. Profesori shikon dorezime studentësh:
   GET /api/profesoret/{profesorId}/dorezime-studentesh/{lendaId}
   ↓
   Backend Query:
   ```typescript
   const submissions = await dorezimiIdeeshRepository.find({
     where: { lenda: { id: lendaId }, isShabllon: false },
     relations: ["student", "lenda"]
   });
   // Filter në JavaScript: .filter(sub => !sub.profesorId)
   ```
   ↓
   Response: Lista e dorezimeve vetëm nga studentët
```

#### ❌ Problemet në Flow Aktual

1. **Filtrim në JavaScript në vend të SQL** (profesorRoutes.ts:528)
   ```typescript
   // ❌ JO OPTIMAL:
   const submissions = await dorezimiIdeeshRepository.find({ ... });
   const studentSubmissions = submissions.filter(sub => !sub.profesorId);
   
   // ✅ OPTIMAL (do të ishte):
   const submissions = await dorezimiIdeeshRepository.find({
     where: { 
       lenda: { id: lendaId }, 
       isShabllon: false,
       student: Not(IsNull()) // Vetëm nga studentët
     }
   });
   ```

2. **Mungesë e Feedback Endpoint-it**
   - Studenti pret feedback (Ide.jsx:140-147) por backend-i **nuk ka endpoint për feedback**
   - Frontend-i ka `navigate('/student/feedback')` por nuk ekziston API për të ruajtur/lexuar feedback

3. **Mungon Validimi i Rolit**
   - Nuk kontrollohet nëse profesori është i caktuar për lëndën
   - Çdo profesor mund të shohë çdo lëndë (nuk ka validim për `profesor.lendet`)

---

### 3.2 Feedback Flow (NONFUNKSIONAL)

#### ❌ Gjendja Aktuale

```
Frontend (Student/Ide.jsx:140-147):
const handleFeedback = () => {
  const feedBackId = 1; // ❌ Hardcoded!
  if (feedBackId === 1) {
    navigate('/student/feedback', { state: { lendaId, subject } });
  }
};

Frontend (Student/feedback.jsx):
// ❌ NUK KA THIRRJE API - Vetëm UI mock

Backend:
// ❌ NUK EKZISTON endpoint për feedback
// Nuk ka entitet Feedback në entities/
// Nuk ka route për /api/studentet/:id/feedback
```

#### ✅ Implementimi i Duhur (Do të duhet krijuar)

```typescript
// Backend: entities/Feedback.ts
@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DorezimiIdes, { onDelete: "CASCADE" })
  dorezim: DorezimiIdes;

  @ManyToOne(() => Profesor, { onDelete: "CASCADE" })
  profesor: Profesor;

  @Column("text")
  koment: string;

  @Column({ nullable: true })
  vleresimi?: number; // 1-10

  @Column({ default: false })
  isApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;
}

// Backend Route (POST):
POST /api/profesoret/:profesorId/feedback
Body: { dorezimId, koment, vleresimi }

// Backend Route (GET):
GET /api/studentet/:studentId/feedback/:dorezimId
Response: { koment, vleresimi, createdAt }
```

---

## 🚨 PART 4: Mospërputhjet Kritike (File by File)

### 4.1 Backend Mismatch

#### ❌ Problem 1: projektiRoutesp.ts NUK është montuar
**File**: `Backend/src/index.ts`  
**Rreshti**: 58-63

```typescript
// ❌ MUNGON:
import projektiRoutesp from "./routes/Profesor/projektiRoutesp";
app.use("/api/projektip", projektiRoutesp);

// Aktualisht ekzistojnë vetëm:
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/profesoret", profesorRoutes);
app.use("/api/studentet", studentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", setupRoutes);
```

**Efekti**: Frontend-i thërret `/projektip/${profesorId}` por merr **404 Not Found** sepse route-i nuk është regjistruar!

---

#### ❌ Problem 2: Filtrim Inefficient në Profesor Dorezime
**File**: `Backend/src/routes/Profesor/profesorRoutes.ts`  
**Rreshti**: 503-545

```typescript
// ❌ INEFFICIENT (rreshti 528):
const submissions = await dorezimiIdeeshRepository.find({
  where: { lenda: { id: lendaId }, isShabllon: false },
  relations: ["student", "lenda"],
});
// Merr ÇDOGJË nga database pastaj filtron me JavaScript
const studentSubmissions = submissions.filter(sub => !sub.profesorId);

// ✅ OPTIMAL (propozimi):
const submissions = await dorezimiIdeeshRepository.find({
  where: { 
    lenda: { id: lendaId }, 
    isShabllon: false,
    student: Not(IsNull())  // SQL-level filter
  },
  relations: ["student", "lenda"],
});
```

---

#### ❌ Problem 3: Mungojnë Endpoint-et për Feedback
**File**: `Backend/src/routes/Student/studentRoutes.ts`  
**Mungojnë Endpoint-et**:
- GET `/api/studentet/:id/feedback/:dorezimId` (për të lexuar feedback-un)
- POST `/api/studentet/:id/feedback/:dorezimId/response` (për të përgjigjur në feedback)

**File**: `Backend/src/routes/Profesor/profesorRoutes.ts`  
**Mungon Endpoint-i**:
- POST `/api/profesoret/:id/feedback` (për të dërguar feedback)

---

### 4.2 Frontend Mismatch

#### ❌ Problem 1: profesorApi.js thërret endpoint të gabuar për projekte
**File**: `Frontend/src/services/profesorApi.js`  
**Rreshti**: 143-167

```javascript
// ❌ GABIM (nuk funksionon):
export const getProfesorProjects = (profesorId) =>
  request(`/projektip/${profesorId}`);  // 404 sepse route mungon në index.ts

export const createProfesorProject = (profesorId, payload) =>
  request(`/projektip/${profesorId}`, { method: 'POST', ... });

// ✅ KORRIGJIMI (nëse duam të përdorim route-in ekzistues):
// Duhet të montohet në Backend/src/index.ts OSEEE
// Alternativa: Përdor endpoint-in e studentëve (jo ideal)
```

---

#### ❌ Problem 2: Mock Data në vend të API calls
**File**: `Frontend/src/Profesor/idetep.jsx`  
**Rreshti**: 36-48

```javascript
// ❌ MOCK DATA:
const mockFiles = [
  { id: 1, fileName: 'Projekti_Final.docx', studentName: 'Agon Berisha', ... },
  ...
];
setFiles(mockFiles);

// ✅ DUHET TË THIRRË:
const files = await getStudentSubmissions(PROFESOR_ID, lendaId);
setFiles(files.submissions || []);
```

**File**: `Frontend/src/Profesor/dorezimet-studentesh.jsx`  
**Rreshti**: 44-62

```javascript
// ❌ MOCK FALLBACK:
if (fetched.length === 0) {
  const mockData = [ ... ];
  setSubmissions(mockSubmissions);
}

// ✅ DUHET TË JETË:
setSubmissions(fetched);  // Pa fallback artificial
```

---

#### ❌ Problem 3: Feedback nuk funksionon fare
**File**: `Frontend/src/Student/Ide.jsx`  
**Rreshti**: 140-147

```javascript
const handleFeedback = () => {
  const feedBackId = 1; //❌ Hardcoded
  if (feedBackId === 1) {
    navigate('/student/feedback', { state: { lendaId, subject } });
  } else {
    alert('Nuk ka ende feedback...');  // Gjithmonë shfaq këtë
  }
};
```

**File**: `Frontend/src/Student/feedback.jsx`  
Nuk ka asnjë thirrje fetch/axios - vetëm UI static!

---

## 📋 PART 5: Plani i Unifikimit (Step-by-Step)

### Phase 1: Fix Backend Critical Issues ⚠️ PRIORITY

#### Step 1.1: Monto projektiRoutesp.ts në aplikacion
**File**: `Backend/src/index.ts`  
**Action**: Add route registration

```typescript
// Pas linjës 8 (pas import-eve të routes):
import projektiRoutesp from "./routes/Profesor/projektiRoutesp";

// Pas linjës 61 (para app.use("/api", setupRoutes)):
app.use("/api/projektip", projektiRoutesp);
```

---

#### Step 1.2: Optimizo Filtrim në profesorRoutes.ts
**File**: `Backend/src/routes/Profesor/profesorRoutes.ts`  
**Line**: 503-545

```typescript
// Zëvendëso logjikën ekzistuese:
router.get("/:id/dorezime-studentesh/:lendaId", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = Number(req.params.lendaId);

  if (Number.isNaN(profesorId) || Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  try {
    const profesor = await profesorRepository.findOneBy({ id: profesorId });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor not found" });
    }

    const lenda = await lendetRepository.findOneBy({ id: lendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    // ✅ OPTIMIZED: SQL-level filtering
    const submissions = await dorezimiIdeeshRepository.find({
      where: { 
        lenda: { id: lendaId }, 
        isShabllon: false,
        student: Not(IsNull())  // Vetëm student submissions
      },
      relations: ["student", "lenda"],
      order: { createdAt: "DESC" },
    });

    const submissionsData = submissions.map((sub) => ({
      id: sub.id,
      student: sub.student ? {
        id: sub.student.id,
        emri: sub.student.emri,
        mbiemri: sub.student.mbiemri,
        fullName: `${sub.student.emri} ${sub.student.mbiemri}`.trim(),
      } : null,
      fileName: sub.fileName,
      fileDorezimi: sub.fileDorezimi,
      fileUrl: sub.fileDorezimi.startsWith("uploads/")
        ? `/${sub.fileDorezimi}`
        : `/uploads/${sub.fileDorezimi}`,
      createdAt: sub.createdAt,
    }));

    res.json({ submissions: submissionsData });
  } catch (error) {
    res.status(500).json({ message: "Error fetching submissions", error });
  }
});
```

**Benefit**: Redukton network overhead dhe përshpejton query-t për tabela të mëdha.

---

#### Step 1.3: Krijo Feedback Endpoints (NEW FEATURE)

**File**: `Backend/src/entities/Feedback.ts` (CREATE NEW)

```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, JoinColumn } from "typeorm";
import { DorezimiIdes } from "./Student/dorezimiides";
import { Profesor } from "./Profesor/Profesor";
import { Student } from "./Student/Student";

@Entity()
export class Feedback {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => DorezimiIdes, { onDelete: "CASCADE" })
  @JoinColumn({ name: "dorezimId" })
  dorezim: DorezimiIdes;

  @Column()
  dorezimId: number;

  @ManyToOne(() => Profesor, { onDelete: "CASCADE" })
  @JoinColumn({ name: "profesorId" })
  profesor: Profesor;

  @Column()
  profesorId: number;

  @Column({ nullable: true })
  studentId?: number;

  @Column("text")
  koment: string;

  @Column({ nullable: true })
  vleresimi?: number; // 1-10

  @Column({ default: false })
  isApproved: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
```

**File**: `Backend/src/data-source.ts`  
**Action**: Register Feedback entity

```typescript
import { Feedback } from "./entities/Feedback";

// Në entities array:
entities: [
  User, Admin, Profesor, Student,
  Lendet, Idete, DorezimiIdes, Projekti, dorzimiProjektit,
  MenaxhimiAfateve, Admin2,
  Feedback  // ✅ ADD THIS
],
```

**File**: `Backend/src/routes/Profesor/profesorRoutes.ts`  
**Action**: Add feedback endpoint (After line 745)

```typescript
import { Feedback } from "../../entities/Feedback";
const feedbackRepository = AppDataSource.getRepository(Feedback);

// POST feedback për një dorezim student
router.post("/:id/feedback", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const { dorezimId, koment, vleresimi } = req.body;

  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  if (!dorezimId || !koment) {
    return res.status(400).json({ message: "dorezimId dhe koment janë të detyrueshme" });
  }

  try {
    const profesor = await profesorRepository.findOneBy({ id: profesorId });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor not found" });
    }

    const dorezim = await dorezimiIdeeshRepository.findOne({
      where: { id: Number(dorezimId) },
      relations: ["student"],
    });

    if (!dorezim) {
      return res.status(404).json({ message: "Dorezim nuk u gjet" });
    }

    const feedback = feedbackRepository.create({
      dorezim,
      profesor,
      studentId: dorezim.student?.id,
      koment: koment.trim(),
      vleresimi: vleresimi ? Number(vleresimi) : null,
      isApproved: false,
    });

    const saved = await feedbackRepository.save(feedback);

    res.status(201).json({
      id: saved.id,
      koment: saved.koment,
      vleresimi: saved.vleresimi,
      createdAt: saved.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating feedback", error });
  }
});

export default router;
```

**File**: `Backend/src/routes/Student/studentRoutes.ts`  
**Action**: Add feedback retrieval endpoint (After line 960)

```typescript
import { Feedback } from "../../entities/Feedback";
const feedbackRepository = AppDataSource.getRepository(Feedback);

// GET feedback për një dorezim të studentit
router.get("/:id/feedback/:dorezimId", async (req: Request, res: Response) => {
  const studentId = Number(req.params.id);
  const dorezimId = Number(req.params.dorezimId);

  if (Number.isNaN(studentId) || Number.isNaN(dorezimId)) {
    return res.status(400).json({ message: "Invalid parameters" });
  }

  try {
    const student = await studentRepository.findOneBy({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const feedback = await feedbackRepository.findOne({
      where: { dorezimId, studentId },
      relations: ["profesor"],
      order: { createdAt: "DESC" },
    });

    if (!feedback) {
      return res.status(404).json({ message: "Feedback nuk u gjet" });
    }

    res.json({
      id: feedback.id,
      koment: feedback.koment,
      vleresimi: feedback.vleresimi,
      profesor: feedback.profesor ? {
        emri: feedback.profesor.emri,
        mbiemri: feedback.profesor.mbiemri,
      } : null,
      createdAt: feedback.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching feedback", error });
  }
});

export default router;
```

---

### Phase 2: Update Frontend API Calls

#### Step 2.1: Fix profesorApi.js projekt calls
**File**: `Frontend/src/services/profesorApi.js`  
**Lines**: 143-167

**Option A** (Preferred): Keep using mounted route
```javascript
// ✅ NO CHANGES NEEDED if you mount the route in index.ts
// Just ensure backend has: app.use("/api/projektip", projektiRoutesp);
```

**Option B** (Alternative): Use student route pattern
```javascript
// If you don't want separate projekt routes, unify with student pattern:
export const getProfesorProjects = (profesorId) =>
  request(`/profesoret/${profesorId}/projekti`);  // Match student pattern
```

---

#### Step 2.2: Remove Mock Data from idetep.jsx
**File**: `Frontend/src/Profesor/idetep.jsx`  
**Lines**: 16-62

```jsx
// ❌ DELETE THIS ENTIRE SECTION (lines 16-62):
const [files, setFiles] = useState([]);
const [filesStatus, setFilesStatus] = useState({ loading: true, error: null });
const loadFiles = useCallback(async () => { ... mockFiles ... }, []);

// ✅ REPLACE WITH:
// Files are now loaded from getStudentSubmissions API
// Remove dual state management
```

**Updated Component**:
```jsx
import { getProfesorIdeas, getStudentSubmissions } from '../services/profesorApi';

const Idetep = () => {
  const [ideas, setIdeas] = useState([]);
  const [submissions, setSubmissions] = useState([]);  // Renamed from 'files'
  const [listStatus, setListStatus] = useState({ loading: true, error: null });

  const loadData = useCallback(async () => {
    setListStatus({ loading: true, error: null });
    try {
      const [ideasData, submissionsData] = await Promise.all([
        getProfesorIdeas(PROFESOR_ID, lendaId),
        getStudentSubmissions(PROFESOR_ID, lendaId)
      ]);
      
      setIdeas(ideasData);
      setSubmissions(submissionsData.submissions || []);
      setListStatus({ loading: false, error: null });
    } catch (error) {
      setListStatus({ loading: false, error: error?.message ?? 'Nuk u lexuan të dhënat.' });
    }
  }, [PROFESOR_ID, lendaId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // ... rest of component
};
```

---

#### Step 2.3: Remove Mock Fallback from dorezimet-studentesh.jsx
**File**: `Frontend/src/Profesor/dorezimet-studentesh.jsx`  
**Lines**: 44-79

```jsx
// ❌ DELETE MOCK FALLBACK (lines 44-71):
if (fetched.length === 0) {
  const mockData = [ ... ];
  // ...
}

// ✅ REPLACE WITH CLEAN IMPLEMENTATION:
const fetchSubmissions = async () => {
  try {
    const data = await getStudentSubmissions(PROFESOR_ID, lendaId);
    if (!isMounted) return;
    
    setSubmissions(data.submissions || []);
    setStatus({ loading: false, error: null });
  } catch (error) {
    if (!isMounted) return;
    setStatus({
      loading: false,
      error: error?.message ?? 'Nuk u lexuan projektet e studentëve.',
    });
  }
};
```

---

#### Step 2.4: Implement Real Feedback (Frontend)

**File**: `Frontend/src/services/studentApi.js`  
**Action**: Add feedback functions

```javascript
export const getStudentFeedback = (studentId, dorezimId) =>
  request(`/studentet/${studentId}/feedback/${dorezimId}`);

export default {
  // ... existing exports
  getStudentFeedback,
};
```

**File**: `Frontend/src/services/profesorApi.js`  
**Action**: Add feedback function

```javascript
export const submitFeedback = (profesorId, payload) =>
  request(`/profesoret/${profesorId}/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

export default {
  // ... existing exports
  submitFeedback,
};
```

**File**: `Frontend/src/Student/Ide.jsx`  
**Lines**: 140-147

```jsx
// ✅ REPLACE WITH REAL API CALL:
const handleFeedback = async () => {
  try {
    // Assume we have the dorezimId from state or from getStudentIdeaSubmission
    const dorezimId = currentDorezim?.id;  // Get from state
    
    if (!dorezimId) {
      alert('Nuk ka dorezim të lidhur me këtë ide.');
      return;
    }

    const feedbackData = await getStudentFeedback(STUDENT_ID, dorezimId);
    
    navigate('/student/feedback', {
      state: {
        lendaId,
        subject: subjectName,
        feedback: feedbackData  // Pass real feedback
      }
    });
  } catch (error) {
    if (error.message.includes('404')) {
      alert('Nuk ka ende feedback të lidhur me këtë ide.');
    } else {
      alert('Gabim në leximin e feedback-ut: ' + error.message);
    }
  }
};
```

**File**: `Frontend/src/Student/feedback.jsx`  
**Action**: Update to display real feedback from API

```jsx
import { useLocation } from 'react-router-dom';

const FeedbackPage = () => {
  const location = useLocation();
  const { feedback, subject, lendaId } = location.state || {};

  if (!feedback) {
    return (
      <div>
        <p>Nuk ka feedback të disponueshëm.</p>
      </div>
    );
  }

  return (
    <div>
      <h2>Feedback për: {subject}</h2>
      <p><strong>Profesori:</strong> {feedback.profesor?.emri} {feedback.profesor?.mbiemri}</p>
      <p><strong>Koment:</strong> {feedback.koment}</p>
      {feedback.vleresimi && <p><strong>Vlerësimi:</strong> {feedback.vleresimi}/10</p>}
      <p><strong>Data:</strong> {new Date(feedback.createdAt).toLocaleDateString('sq-AL')}</p>
    </div>
  );
};

export default FeedbackPage;
```

**File**: `Frontend/src/Profesor/dorezimet-studentesh.jsx`  
**Action**: Add feedback submission UI

```jsx
import { submitFeedback } from '../services/profesorApi';

const DoreziметStudentesh = () => {
  const [feedbackForm, setFeedbackForm] = useState({ dorezimId: null, koment: '', vleresimi: '' });
  
  const handleSubmitFeedback = async (dorezimId) => {
    if (!feedbackForm.koment.trim()) {
      alert('Ju lutem shkruani një koment.');
      return;
    }

    try {
      await submitFeedback(PROFESOR_ID, {
        dorezimId,
        koment: feedbackForm.koment,
        vleresimi: feedbackForm.vleresimi ? Number(feedbackForm.vleresimi) : null,
      });
      
      alert('Feedback-u u dërgua me sukses!');
      setFeedbackForm({ dorezimId: null, koment: '', vleresimi: '' });
    } catch (error) {
      alert('Gabim në dërgimin e feedback-ut: ' + error.message);
    }
  };

  // Add feedback form UI to each submission card
  return (
    <div>
      {/* ... existing code ... */}
      {submissions.map((submission) => (
        <div key={submission.id}>
          {/* ... existing display ... */}
          
          <div style={{ marginTop: 16, padding: 12, background: 'rgba(0,0,0,0.3)', borderRadius: 8 }}>
            <h4>Jep Feedback</h4>
            <textarea
              value={feedbackForm.dorezimId === submission.id ? feedbackForm.koment : ''}
              onChange={(e) => setFeedbackForm({ dorezimId: submission.id, koment: e.target.value, vleresimi: feedbackForm.vleresimi })}
              placeholder="Shkruaj komentin këtu..."
              style={{ width: '100%', minHeight: 80, padding: 8 }}
            />
            <input
              type="number"
              min="1"
              max="10"
              value={feedbackForm.dorezimId === submission.id ? feedbackForm.vleresimi : ''}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, vleresimi: e.target.value })}
              placeholder="Vlerësimi (1-10)"
              style={{ marginTop: 8, padding: 8 }}
            />
            <button onClick={() => handleSubmitFeedback(submission.id)} style={{ marginTop: 8 }}>
              Dërgo Feedback
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};
```

---

### Phase 3: Advanced Unification (RBAC - Optional Future Work)

#### Koncepti: Role-Based Unified Endpoints

Në vend të:
- `/api/studentet/:id/lendet/:yearId`
- `/api/profesoret/:id/lendet/:yearId`

Mund të kemi:
- `/api/courses/:yearId` + **Middleware** që kontrollon rolin nga session

**Benefit**: Një endpoint i vetëm që ndryshon vetëm filtrat bazuar në rol.

**Implementation** (Future):

```typescript
// middleware/roleBasedFilter.ts
export const roleBasedFilter = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;  // From passport session
  
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // Attach filter conditions based on role
  if (user.role === 'student') {
    req.queryFilters = { student: { id: user.id } };
  } else if (user.role === 'profesor') {
    req.queryFilters = { profesor: { id: user.id } };
  }
  
  next();
};

// Unified Route:
router.get("/courses/:yearId", roleBasedFilter, async (req, res) => {
  const { queryFilters } = req;
  
  const courses = await lendetRepository.find({
    where: { viti: Number(req.params.yearId), ...queryFilters },
    relations: ["profesor", "student"],
  });
  
  res.json(courses);
});
```

**Status**: ⏳ Mund të implementohet në version 2.0.0

---

## 📊 Përmbledhje e Ndryshimeve (Checklist)

### ✅ Backend Changes

| File | Action | Rreshti | Status |
|------|--------|---------|--------|
| `Backend/src/index.ts` | Add `app.use("/api/projektip", projektiRoutesp)` | After line 61 | ⏳ Pending |
| `Backend/src/routes/Profesor/profesorRoutes.ts` | Optimize dorezime-studentesh filtering (SQL instead of JS) | 503-545 | ⏳ Pending |
| `Backend/src/entities/Feedback.ts` | Create new Feedback entity | NEW FILE | ⏳ Pending |
| `Backend/src/data-source.ts` | Register Feedback entity | Add to entities array | ⏳ Pending |
| `Backend/src/routes/Profesor/profesorRoutes.ts` | Add POST `/profesoret/:id/feedback` endpoint | After line 745 | ⏳ Pending |
| `Backend/src/routes/Student/studentRoutes.ts` | Add GET `/studentet/:id/feedback/:dorezimId` endpoint | After line 960 | ⏳ Pending |

### ✅ Frontend Changes

| File | Action | Rreshti | Status |
|------|--------|---------|--------|
| `Frontend/src/Profesor/idetep.jsx` | Remove mock files, use getStudentSubmissions API | 16-62 | ⏳ Pending |
| `Frontend/src/Profesor/dorezimet-studentesh.jsx` | Remove mock fallback | 44-71 | ⏳ Pending |
| `Frontend/src/Student/Ide.jsx` | Implement real feedback API call | 140-147 | ⏳ Pending |
| `Frontend/src/Student/feedback.jsx` | Display real feedback from API | Entire file | ⏳ Pending |
| `Frontend/src/services/studentApi.js` | Add `getStudentFeedback` function | NEW | ⏳ Pending |
| `Frontend/src/services/profesorApi.js` | Add `submitFeedback` function | NEW | ⏳ Pending |
| `Frontend/src/Profesor/dorezimet-studentesh.jsx` | Add feedback submission UI | NEW SECTION | ⏳ Pending |

---

## 🎯 Prioriteti i Implementimit

### 🔴 CRITICAL (Implemento menjëherë)
1. **Mount projektiRoutesp.ts** në `Backend/src/index.ts`
   - Pa këtë, projektet e profesorit NUK funksionojnë fare
   - Gabim: 404 Not Found

2. **Optimize SQL filtering** në `profesorRoutes.ts:503-545`
   - Performance issue për tabela të mëdha
   - Merr të gjithë rekordët pastaj filtron me JavaScript

### 🟡 HIGH (Implemento këtë javë)
3. **Krijo Feedback system** (Backend + Frontend)
   - Feature incomplete - vetëm UI mock
   - Studentët nuk mund të shohin feedback real
   - Profesorët nuk mund të dërgojnë feedback

4. **Remove mock data** nga frontend (idetep.jsx, dorezimet-studentesh.jsx)
   - Konfuzon testin - nuk e di nëse API funksionon

### 🟢 MEDIUM (Planifiko për version tjetër)
5. **Implement RBAC unified endpoints**
   - Nuk është blocker, por përmirëson arkitekturën
   - Redukon code duplication

---

## 📖 Dokumentacioni i Referencës

### Backend API Endpoints (Pas Implementimit)

#### Student Endpoints
```
GET    /api/studentet/:id/dashboard
GET    /api/studentet/:id/lendet/:yearId
GET    /api/studentet/:id/idet?lendaId=X
POST   /api/studentet/:id/idet
PUT    /api/studentet/:id/idet/:ideaId
DELETE /api/studentet/:id/idet/:ideaId
POST   /api/studentet/:id/dorezime
GET    /api/studentet/:id/dorezime?lendaId=X
GET    /api/studentet/:id/dorezime/shabllon?lendaId=X
DELETE /api/studentet/:id/dorezime/:dorezimId
GET    /api/studentet/:id/feedback/:dorezimId  ✨ NEW
```

#### Profesor Endpoints
```
GET    /api/profesoret/:id/dashboard
GET    /api/profesoret/:id/lendet/:yearId
GET    /api/profesoret/:id/idet?lendaId=X
POST   /api/profesoret/:id/idet
POST   /api/profesoret/:id/dorezime
GET    /api/profesoret/:id/dorezime?lendaId=X
GET    /api/profesoret/:id/dorezime/shabllon?lendaId=X
GET    /api/profesoret/:id/dorezime-studentesh/:lendaId
POST   /api/profesoret/:id/lendet/:lendaId/template
GET    /api/profesoret/:id/lendet/:lendaId/template
DELETE /api/profesoret/:id/lendet/:lendaId/template
POST   /api/profesoret/:id/feedback  ✨ NEW
```

#### Projekt Endpoints (Mounted)
```
GET    /api/projektip/:profesorId
GET    /api/projektip/:profesorId/:id
POST   /api/projektip/:profesorId
PUT    /api/projektip/:profesorId/:id
DELETE /api/projektip/:profesorId/:id
```

---

## ⚠️ Breaking Changes Warning

Pas implementimit të këtyre ndryshimeve:

1. **Database Migration Required**:
   - Tabela e re `Feedback` do të krijohet
   - Nuk prish të dhënat ekzistuese

2. **Frontend Updates Required**:
   - Komponentët që përdorin mock data duhet të testojnë me API real
   - Feedback UI do të funksionojë vetëm pas backend update-it

3. **Testing Checklist**:
   - ✅ Profesori mund të klikojë "Projektet" dhe të shohë listën
   - ✅ Profesori mund të shohë dorezime nga studentët
   - ✅ Profesori mund të dërgojë feedback
   - ✅ Studenti mund të shohë feedback-un e marrë
   - ✅ Performance: Dorezime-studentesh query ekzekutohet me SQL (jo JS filter)

---

## 📞 Kontakt për Pyetje

Nëse ke pyetje rreth implementimit:
1. Lexo këtë dokumentacion sërish
2. Kontrollo REFACTORING_SUMMARY.md për detaje mbi relacionet
3. Testo çdo ndryshim në development para se të deploy-osh në production

---

**Përfundim**: Sistemi është **80% i unifikuar** në nivel database dhe routes, por **frontend-i ka nevojë për 20% cleanup** (heqje e mock data dhe feedback implementation).

**Estimated Work**: 8-12 orë për implementim të plotë të Phase 1 dhe Phase 2.

---

_Dokumenti i gjeneruar automatikisht nga GitHub Copilot · Versioni 1.0 · 21 Janar 2026_
