import { Router, Request, Response } from "express";
import { FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../../data-source";
import multer from "multer";
import path from "path";
import fs from "fs";
// Import entities - tani përdorim vetëm tabelat e unifikuara pa duplikatat
import { Profesor } from "../../entities/Profesor/Profesor";
import { DorezimiIdes } from "../../entities/Student/dorezimiIdes";
import { Student } from "../../entities/Student/Student";
import { Lendet } from "../../entities/Student/Lendet";
import { Idete } from "../../entities/Student/Idete";
import { dorzimiProjektit } from "../../entities/Student/dorzimiProjektit";
import { ProfesorLendetMapping } from "../../entities/Student/ProfesorLendetMapping";

const router = Router();
const profesorRepository = AppDataSource.getRepository(Profesor);
const lendetRepository = AppDataSource.getRepository(Lendet);
const ideteRepository = AppDataSource.getRepository(Idete);
const dorezimiIdeeshRepository = AppDataSource.getRepository(DorezimiIdes);
const studentRepository = AppDataSource.getRepository(Student);
const dorezimProjektitRepository = AppDataSource.getRepository(dorzimiProjektit);
const mappingRepository = AppDataSource.getRepository(ProfesorLendetMapping);

// Multer config for file upload (disk storage)
const uploadDir = path.resolve(process.cwd(), "uploads", "dorezime");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `dorezim-${unique}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = [".doc", ".docx", "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    const mime = file.mimetype;
    if (allowed.includes(ext) || allowed.includes(mime)) {
      cb(null, true);
    } else {
      cb(new Error("Lejohen vetem DOC/DOCX"));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

// Multer config for instruction files
const instructionUploadDir = path.resolve(process.cwd(), "uploads", "instructions");
if (!fs.existsSync(instructionUploadDir)) {
  fs.mkdirSync(instructionUploadDir, { recursive: true });
}

const instructionStorage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, instructionUploadDir),
  filename: (_req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `instruction-${unique}${ext}`);
  }
});

const uploadInstructions = multer({ storage: instructionStorage });

// Multer config për template upload (PDF, DOC, DOCX, TXT)
const uploadTemplate = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    const allowed = [
      ".pdf",
      ".doc",
      ".docx",
      ".txt",
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"
    ];
    const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
    const mime = file.mimetype;
    if (allowed.includes(ext) || allowed.includes(mime)) {
      cb(null, true);
    } else {
      cb(new Error("Lejohen PDF, DOC, DOCX, TXT"));
    }
  },
  limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

const formatProfesorSummary = (profesor: Profesor | Student) => ({
  id: profesor.id,
  emri: profesor.emri,
  mbiemri: profesor.mbiemri,
  fullName: `${profesor.emri} ${profesor.mbiemri}`.trim(),
  email: profesor.email,
});

const getYearLabel = (yearNumber: number) => {
  const roman = ["I", "II", "III", "IV", "V", "VI"];
  return `Viti ${roman[yearNumber - 1] ?? yearNumber}`;
};

// Dashboard snapshot for a profesor
// ✅ ALIGNED WITH STUDENT: Uses ProfesorLendetMapping to get assigned subjects
router.get("/:id/dashboard", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);

  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  try {
    // Check both profesoret and studentet tables
    let profesor = await profesorRepository.findOneBy({ id: profesorId });
    let profesorData: Profesor | Student | null = profesor;

    if (!profesor) {
      const student = await studentRepository.findOneBy({ id: profesorId });
      if (!student) {
        return res.status(404).json({ message: "Profesor not found" });
      }
      profesorData = student;
    }

    if (!profesorData) {
      return res.status(404).json({ message: "Profesor not found" });
    }

    // ✅ UNIFIED: Get lendet assigned to this profesor via mapping table
    const mappings = await mappingRepository.find({ where: { profesorId } });
    const lendetIds = mappings.map(m => m.lendetId);

    const lendet = lendetIds.length > 0
      ? await lendetRepository.find({
        where: lendetIds.map(id => ({ id })),
        order: { viti: "ASC", semestri: "ASC" }
      })
      : [];

    const yearMap = new Map<number, {
      id: string;
      label: string;
      semesters: number[];
      totalSubjects: number;
      electiveSubjects: number;
    }>();

    lendet.forEach((lenda) => {
      const yearNumber = lenda.viti ?? Math.max(1, Math.ceil(lenda.semestri / 2));
      if (!yearMap.has(yearNumber)) {
        yearMap.set(yearNumber, {
          id: String(yearNumber),
          label: getYearLabel(yearNumber),
          semesters: [],
          totalSubjects: 0,
          electiveSubjects: 0,
        });
      }

      const entry = yearMap.get(yearNumber)!;
      entry.totalSubjects += 1;
      if (lenda.isZgjedhore) {
        entry.electiveSubjects += 1;
      }
      if (!entry.semesters.includes(lenda.semestri)) {
        entry.semesters.push(lenda.semestri);
        entry.semesters.sort((a, b) => a - b);
      }
    });

    const years = Array.from(yearMap.entries())
      .sort((a, b) => a[0] - b[0])
      .map(([, value]) => value);

    res.json({
      profesor: formatProfesorSummary(profesorData),
      years,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
});

// Curriculum view per year
// ✅ PERFECTLY ALIGNED WITH STUDENT: Same endpoint structure, same data format
router.get("/:id/lendet/:yearId", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const yearParam = Number(req.params.yearId);

  console.log(`=== FETCHING SUBJECTS FOR PROFESOR ===`);
  console.log(`Profesor ID: ${profesorId}, Year: ${yearParam}`);

  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  if (Number.isNaN(yearParam) || yearParam < 1) {
    return res.status(400).json({ message: "Parametri yearId duhet te jete numer pozitiv" });
  }

  try {
    // Check both profesoret and studentet tables
    let profesor = await profesorRepository.findOneBy({ id: profesorId });
    let profesorData: Profesor | Student | null = profesor;

    if (!profesor) {
      const student = await studentRepository.findOneBy({ id: profesorId });
      if (!student) {
        return res.status(404).json({ message: "Profesor not found" });
      }
      profesorData = student;
    }

    if (!profesorData) {
      return res.status(404).json({ message: "Profesor not found" });
    }

    // ✅ UNIFIED: Get lendet assigned to this profesor via mapping table
    const mappings = await mappingRepository.find({ where: { profesorId } });
    console.log(`Found ${mappings.length} mappings:`, mappings.map(m => ({ lendetId: m.lendetId })));

    const lendetIds = mappings.map(m => m.lendetId);

    // Get all assigned subjects and filter by year in memory
    const allAssignedLendet = lendetIds.length > 0
      ? await lendetRepository.find({
        where: lendetIds.map(id => ({ id })),
        order: { viti: "ASC", semestri: "ASC", emriLendes: "ASC" },
      })
      : [];

    console.log(`Found ${allAssignedLendet.length} assigned lendet:`, allAssignedLendet.map(l => ({ id: l.id, name: l.emriLendes, viti: l.viti, semestri: l.semestri })));

    // Filter by the specific year being viewed
    const lendet = allAssignedLendet.filter(l => l.viti === yearParam);
    console.log(`After filtering by year ${yearParam}, found ${lendet.length} subjects`);

    const semesterMap = new Map<number, {
      id: number;
      name: string;
      subjects: { id: number; name: string; isElective: boolean }[];
    }>();

    lendet.forEach((lenda) => {
      if (!semesterMap.has(lenda.semestri)) {
        semesterMap.set(lenda.semestri, {
          id: lenda.semestri,
          name: `Semestri ${lenda.semestri}`,
          subjects: [],
        });
      }

      semesterMap.get(lenda.semestri)!.subjects.push({
        id: lenda.id,
        name: lenda.emriLendes,  // ✅ Uses emriLendes (not emrip)
        isElective: lenda.isZgjedhore,  // ✅ Uses isZgjedhore (not isElectivep)
      });
    });

    const semestersPayload = Array.from(semesterMap.values()).sort((a, b) => a.id - b.id);

    const electives = lendet
      .filter((lenda) => lenda.isZgjedhore)
      .map((lenda) => ({
        id: lenda.id,
        name: lenda.emriLendes,
        semester: lenda.semestri,
      }));

    res.json({
      profesor: formatProfesorSummary(profesorData),
      year: { id: String(yearParam), title: getYearLabel(yearParam) },
      semesters: semestersPayload,
      electives,
      selectedElectives: [],
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching lendet", error });
  }
});

// Idea listing per profesor (optional filter by lenda)
// ✅ UNIFIED WITH STUDENT: Reads from same Idete table, shows all ideas (student + profesor)
router.get("/:id/idet", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = req.query.lendaId ? Number(req.query.lendaId) : undefined;

  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  if (lendaId !== undefined && Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "lendaId duhet te jete numer" });
  }

  try {
    const profesor = await profesorRepository.findOneBy({ id: profesorId });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor not found" });
    }

    // ✅ UNIFIED: Query same Idete table with optional lenda filter
    const whereCondition: FindOptionsWhere<Idete> = lendaId
      ? { lenda: { id: lendaId } }
      : {};

    const ideas = await ideteRepository.find({
      where: whereCondition,
      relations: ["lenda", "student", "profesor"],
      order: { createdAt: "DESC" },
    });

    // ✅ ALIGNED: Same response structure as Student, but includes type and studentName for profesor view
    const ideasData = ideas.map((idea) => ({
      id: idea.id,
      title: idea.titulli,  // ✅ Uses titulli (not titullip)
      shorthand: idea.shkurtesa,  // ✅ Uses shkurtesa (not shkurtesap)
      feedback: idea.feedback,
      subject: idea.lenda
        ? { id: idea.lenda.id, name: idea.lenda.emriLendes }  // ✅ Uses emriLendes
        : null,
      createdAt: idea.createdAt,
      type: idea.student ? "student" : "profesor",  // Extra info for profesor to distinguish
      studentName: idea.student ? `${idea.student.emri} ${idea.student.mbiemri}` : null,
    }));

    res.json(ideasData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching ideas", error });
  }
});

// Create idea for profesor/lenda
router.post("/:id/idet", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const { lendaId, titulli, shkurtesa } = req.body;

  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  if (!lendaId || !titulli || !shkurtesa) {
    return res.status(400).json({ message: "lendaId, titulli dhe shkurtesa jane te detyrueshme" });
  }

  const parsedLendaId = Number(lendaId);
  if (Number.isNaN(parsedLendaId)) {
    return res.status(400).json({ message: "lendaId duhet te jete numer" });
  }

  try {
    const profesor = await profesorRepository.findOneBy({ id: profesorId });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor not found" });
    }

    const lenda = await lendetRepository.findOneBy({ id: parsedLendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    const idea = ideteRepository.create({
      titulli: titulli.trim(),
      shkurtesa: shkurtesa.trim(),
      profesor,
      lenda,
      viti: lenda.viti,
    });

    const savedIdea = await ideteRepository.save(idea);

    res.status(201).json({
      id: savedIdea.id,
      title: savedIdea.titulli,
      shorthand: savedIdea.shkurtesa,
      subject: { id: lenda.id, name: lenda.emriLendes },
      createdAt: savedIdea.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating idea", error });
  }
});

// POST: Shto feedback për ide 
router.post("/:id/idet/:ideaId/feedback", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const ideaId = Number(req.params.ideaId);
  const { feedback } = req.body;

  if (Number.isNaN(profesorId) || Number.isNaN(ideaId)) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  if (!feedback || typeof feedback !== 'string' || feedback.trim().length === 0) {
    return res.status(400).json({ message: "Feedback text is required" });
  }

  try {
    const idea = await ideteRepository.findOne({
      where: { id: ideaId },
      relations: ["profesor", "lenda"],
    });

    if (!idea) {
      return res.status(404).json({ message: "Ide nuk u gjet" });
    }

    // Update feedback
    idea.feedback = feedback.trim();
    idea.feedbackDate = new Date();

    await ideteRepository.save(idea);

    console.log(`✓ Feedback added to idea ${ideaId} by profesor ${profesorId}`);

    res.json({
      message: "Feedback u ruajt me sukses",
      idea: {
        id: idea.id,
        feedback: idea.feedback,
        feedbackDate: idea.feedbackDate,
      }
    });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ message: "Error adding feedback", error: String(error) });
  }
});

// Upload dorezim (Word file saved to disk)
router.post("/:id/dorezime", upload.single("file"), async (req: Request, res: Response) => {
  console.log("=== UPLOAD ENDPOINT HIT ===");
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("File:", req.file ? { name: req.file.originalname, size: req.file.size, path: req.file.path } : "NO FILE");

  const profesorId = Number(req.params.id);
  const { lendaId, isShabllon } = req.body;

  console.log("Profesor ID:", profesorId, "Lenda ID:", lendaId, "Is Template:", isShabllon);

  if (Number.isNaN(profesorId)) {
    console.log("ERROR: Profesor id is invalid");
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  const parsedLendaId = Number(lendaId);
  if (!parsedLendaId || Number.isNaN(parsedLendaId)) {
    console.log("ERROR: lendaId invalid");
    return res.status(400).json({ message: "lendaId eshte i detyrueshem dhe duhet te jete numer" });
  }

  if (!req.file) {
    console.log("ERROR: No file uploaded");
    return res.status(400).json({ message: "Skedari i detyres mungon" });
  }

  try {
    console.log("Looking for profesor ID:", profesorId);
    const profesor = await profesorRepository.findOneBy({ id: profesorId });
    if (!profesor) {
      console.log("ERROR: Profesor not found");
      return res.status(404).json({ message: "Profesor not found" });
    }

    console.log("Found profesor:", profesor.emri);
    const lenda = await lendetRepository.findOneBy({ id: parsedLendaId });
    if (!lenda) {
      console.log("ERROR: Lenda not found");
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    console.log("Found lenda:", lenda.emriLendes);

    // Get relative path from uploads folder
    const filePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, "/");
    console.log("File path to save:", filePath);
    
    const isTemplate = isShabllon === 'true' || isShabllon === true;

    if (isTemplate) {
      const existingTemplate = await dorezimiIdeeshRepository.findOne({
        where: {
          lenda: { id: parsedLendaId },
          isShabllon: true,
        },
        order: { createdAt: "DESC" },
      });

      if (existingTemplate) {
        const oldPath = path.resolve(process.cwd(), existingTemplate.fileDorezimi);
        if (fs.existsSync(oldPath)) {
          try {
            fs.unlinkSync(oldPath);
          } catch (err) {
            console.warn("Could not delete old template file:", oldPath, err);
          }
        }
        await dorezimiIdeeshRepository.remove(existingTemplate);
      }
    }

    const record = dorezimiIdeeshRepository.create({
      profesor,
      lenda,
      fileDorezimi: filePath,
      fileName: req.file.originalname,
      isShabllon: isShabllon === 'true' || isShabllon === true,
    });

    console.log("Created record object", { isShabllon: record.isShabllon });
    const saved = await dorezimiIdeeshRepository.save(record);
    console.log("SAVED TO DB:", saved);

    res.status(201).json({
      id: saved.id,
      fileName: saved.fileName,
      filePath: saved.fileDorezimi,
      isShabllon: saved.isShabllon,
      createdAt: saved.createdAt,
    });
  } catch (error) {
    console.error("=== UPLOAD ERROR ===", error);
    res.status(500).json({ message: "Error uploading dorezim", error: String(error) });
  }
});

// Get template (shabllon) per nje lende
router.get("/:id/dorezime/shabllon", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = req.query.lendaId ? Number(req.query.lendaId) : undefined;

  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  if (!lendaId || Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "lendaId eshte i detyrueshem" });
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

    // Find template (isShabllon: true)
    const template = await dorezimiIdeeshRepository.findOne({
      where: {
        lenda: { id: lendaId },
        isShabllon: true,
      },
      order: { createdAt: "DESC" },
    });

    if (!template) {
      return res.status(404).json({ message: "Template nuk u gjet per kete lende" });
    }

    res.json({
      id: template.id,
      fileName: template.fileName,
      filePath: template.fileDorezimi,
      createdAt: template.createdAt,
    });
  } catch (error) {
    console.error("Template fetch error:", error);
    res.status(500).json({ message: "Error fetching template", error: String(error) });
  }
});

// Get profesor's submitted idea file (non-template) by lenda
router.get("/:id/dorezime", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = req.query.lendaId ? Number(req.query.lendaId) : undefined;

  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  if (!lendaId || Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "lendaId eshte i detyrueshem" });
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

    const submission = await dorezimiIdeeshRepository.findOne({
      where: {
        profesor: { id: profesorId },
        lenda: { id: lendaId },
        isShabllon: false,
      },
      order: { createdAt: "DESC" },
    });

    if (!submission) {
      return res.status(404).json({ message: "Nuk u gjet dorezim per kete lende" });
    }

    const normalizedPath = submission.fileDorezimi.replace(/\\/g, "/");
    const fileUrl = normalizedPath.startsWith("uploads/")
      ? `/` + normalizedPath
      : `/uploads/${normalizedPath}`;

    res.json({
      id: submission.id,
      fileName: submission.fileName,
      fileDorezimi: submission.fileDorezimi,
      fileUrl,
      status: null,
      vleresimi: null,
      feedbackText: null,
      createdAt: submission.createdAt,
    });
  } catch (error) {
    console.error("Error fetching dorezim", error);
    res.status(500).json({ message: "Error fetching dorezim", error: String(error) });
  }
});

// Get all student submissions for a specific subject (for profesor to review)
router.get("/:id/dorezime-studentesh/:lendaId", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = Number(req.params.lendaId);

  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  if (Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "lendaId is invalid" });
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

    console.log("=== FETCHING SUBMISSIONS ===");
    console.log("Profesor ID:", profesorId);
    console.log("Lenda ID:", lendaId);

    // ✅ UPDATED: Don't filter by profesorId - show all submissions for this subject
    const ideaSubmissions = await dorezimiIdeeshRepository.find({
      where: {
        lenda: { id: lendaId },
        isShabllon: false,
      },
      relations: ["student", "lenda"],
      order: { createdAt: "DESC" },
    });

    console.log("Found idea submissions:", ideaSubmissions.length);
    ideaSubmissions.forEach(sub => {
      console.log(` - Idea: ${sub.fileName}, Student: ${sub.student?.emri}, ProfesorId: ${sub.profesorId}`);
    });

    const submissionsData = ideaSubmissions.map((sub) => ({
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

    res.json({
      lenda: { id: lenda.id, name: lenda.emriLendes },
      submissions: submissionsData,
    });
  } catch (error) {
    console.error("Error fetching student submissions:", error);
    res.status(500).json({ message: "Error fetching student submissions", error: String(error) });
  }
});

// Get all student project submissions for a specific subject (for profesor to review)
router.get("/:id/projekte-studentesh/:lendaId", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = Number(req.params.lendaId);

  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  if (Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "lendaId is invalid" });
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

    const submissions = await dorezimProjektitRepository.find({
      where: { lenda: { id: lendaId } },
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
      fileUrl: sub.fileDorezimi.startsWith("uploads/") ? `/${sub.fileDorezimi}` : `/uploads/${sub.fileDorezimi}`,
      piket: sub.piket,
      createdAt: sub.createdAt,
    }));

    // Format dates as local strings (YYYY-MM-DDTHH:MM:SS)
    const formatLocalDate = (date: Date | undefined): string | null => {
      if (!date) return null;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    res.json({
      lenda: {
        id: lenda.id,
        name: lenda.emriLendes,
        projectMaxPoints: lenda.projectMaxPoints ?? 100,
        projectStartDate: formatLocalDate(lenda.projectStartDate),
        projectDeadline: formatLocalDate(lenda.projectDeadline),
        projectDeadlinesJson: lenda.projectDeadlinesJson ?? [],
      },
      submissions: submissionsData,
    });
  } catch (error) {
    console.error("Error fetching student project submissions:", error);
    res.status(500).json({ message: "Error fetching student project submissions", error: String(error) });
  }
});

// Merr afatin e dorëzimit të ideve për një lëndë
router.get("/:id/lendet/:lendaId/idea-deadline", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = Number(req.params.lendaId);

  if (Number.isNaN(profesorId) || Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  const formatLocalDate = (date: Date | undefined): string | null => {
    if (!date) return null;
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  try {
    const lenda = await lendetRepository.findOne({ where: { id: lendaId } });

    if (!lenda) {
      return res.status(404).json({ message: "Lënda nuk u gjet" });
    }

    res.json({
      lenda: {
        id: lenda.id,
        name: lenda.emriLendes,
        ideaStartDate: formatLocalDate(lenda.ideaStartDate),
        ideaDeadline: formatLocalDate(lenda.ideaDeadline),
        ideaTitle: lenda.ideaTitle ?? null,
        ideaDeadlinesJson: lenda.ideaDeadlinesJson ?? null,
      },
    });
  } catch (error) {
    console.error("Error fetching idea deadline:", error);
    res.status(500).json({ message: "Error fetching idea deadline", error: String(error) });
  }
});

// Cakto afatin e dorëzimit të ideve për një lëndë
router.put("/:id/lendet/:lendaId/idea-deadline", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = Number(req.params.lendaId);
  const { ideaStartDate, ideaDeadline, ideaTitle, ideaDeadlinesJson } = req.body;

  if (Number.isNaN(profesorId) || Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  // Parse dates as local timestamps (avoid timezone conversion)
  // Expected format: YYYY-MM-DDTHH:MM:SS
  const parseLocalDate = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) return null;
    const [, year, month, day, hour, minute, second] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  };

  const start = parseLocalDate(ideaStartDate);
  const end = parseLocalDate(ideaDeadline);

  if (ideaStartDate && !start) {
    return res.status(400).json({ message: "Data e fillimit nuk është e vlefshme" });
  }

  if (ideaDeadline && !end) {
    return res.status(400).json({ message: "Afati i dorëzimit nuk është i vlefshëm" });
  }

  if (start && end && start > end) {
    return res.status(400).json({ message: "Data e fillimit duhet të jetë para afatit" });
  }

  try {
    const lenda = await lendetRepository.findOne({ where: { id: lendaId } });

    if (!lenda) {
      return res.status(404).json({ message: "Lënda nuk u gjet" });
    }

    // ✅ Përdor .update() për të vendosur NULL eksplicitisht në databazë
    const updateData: any = {};
    updateData.ideaStartDate = start;
    updateData.ideaDeadline = end;
    updateData.ideaTitle = ideaTitle?.trim() || null;
    if (ideaDeadlinesJson !== undefined) {
      updateData.ideaDeadlinesJson = Array.isArray(ideaDeadlinesJson) ? ideaDeadlinesJson : null;
    }

    await lendetRepository.update({ id: lendaId }, updateData);
    
    // Rifreskon të dhënat pas update
    const updatedLenda = await lendetRepository.findOne({ where: { id: lendaId } });

    console.log(`✓ Idea deadline set for lenda ${lendaId} by profesor ${profesorId}: start=${start?.toISOString() ?? 'null'} end=${end?.toISOString() ?? 'null'} title=${ideaTitle ?? 'null'}`);

    const formatLocalDate = (date: Date | undefined): string | null => {
      if (!date) return null;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    res.json({
      message: "Afati i ideve u përditësua",
      lenda: {
        id: updatedLenda!.id,
        name: updatedLenda!.emriLendes,
        ideaStartDate: formatLocalDate(updatedLenda!.ideaStartDate),
        ideaDeadline: formatLocalDate(updatedLenda!.ideaDeadline),
        ideaTitle: updatedLenda!.ideaTitle ?? null,
        ideaDeadlinesJson: updatedLenda!.ideaDeadlinesJson ?? null,
      },
    });
  } catch (error) {
    console.error("Error setting idea deadline:", error);
    res.status(500).json({ message: "Error setting idea deadline", error: String(error) });
  }
});

// Cakto pikët totale të projektit për një lëndë
router.put("/:id/lendet/:lendaId/project-max", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = Number(req.params.lendaId);
  const { projectMaxPoints } = req.body;

  if (Number.isNaN(profesorId) || Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  if (projectMaxPoints === undefined || projectMaxPoints === null || typeof projectMaxPoints !== "number") {
    return res.status(400).json({ message: "Piket totale janë të detyrueshme dhe duhet të jenë numër" });
  }

  if (projectMaxPoints < 0 || projectMaxPoints > 100) {
    return res.status(400).json({ message: "Piket totale duhet të jenë ndërmjet 0 dhe 100" });
  }

  try {
    const lenda = await lendetRepository.findOne({ where: { id: lendaId } });

    if (!lenda) {
      return res.status(404).json({ message: "Lënda nuk u gjet" });
    }

    lenda.projectMaxPoints = projectMaxPoints;
    await lendetRepository.save(lenda);

    console.log(`✓ Project max points set for lenda ${lendaId} by profesor ${profesorId}: ${projectMaxPoints}`);

    res.json({
      message: "Piket totale u përditësuan",
      lenda: {
        id: lenda.id,
        name: lenda.emriLendes,
        projectMaxPoints: lenda.projectMaxPoints,
      },
    });
  } catch (error) {
    console.error("Error setting project max points:", error);
    res.status(500).json({ message: "Error setting project max points", error: String(error) });
  }
});

// Cakto afatet e projektit për një lëndë
router.put("/:id/lendet/:lendaId/project-deadline", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = Number(req.params.lendaId);
  const { projectStartDate, projectDeadline, projectDeadlinesJson } = req.body;

  if (Number.isNaN(profesorId) || Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  // Parse dates as local timestamps (avoid timezone conversion)
  // Expected format: YYYY-MM-DDTHH:MM:SS
  const parseLocalDate = (dateStr: string | null): Date | null => {
    if (!dateStr) return null;
    // Extract parts from YYYY-MM-DDTHH:MM:SS format
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})$/);
    if (!match) return null;
    const [, year, month, day, hour, minute, second] = match;
    return new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second));
  };

  const start = parseLocalDate(projectStartDate);
  const end = parseLocalDate(projectDeadline);

  if (projectStartDate && !start) {
    return res.status(400).json({ message: "Data e fillimit nuk është e vlefshme" });
  }

  if (projectDeadline && !end) {
    return res.status(400).json({ message: "Afati i dorëzimit nuk është i vlefshëm" });
  }

  if (start && end && start > end) {
    return res.status(400).json({ message: "Data e fillimit duhet të jetë para afatit" });
  }

  try {
    const lenda = await lendetRepository.findOne({ where: { id: lendaId } });

    if (!lenda) {
      return res.status(404).json({ message: "Lënda nuk u gjet" });
    }

    // ✅ Përdor .update() për të vendosur NULL eksplicitisht në databazë
    const updateData: any = {};
    updateData.projectStartDate = start;
    updateData.projectDeadline = end;
    if (projectDeadlinesJson !== undefined) {
      updateData.projectDeadlinesJson = Array.isArray(projectDeadlinesJson) ? projectDeadlinesJson : null;
    }

    await lendetRepository.update({ id: lendaId }, updateData);
    
    // Rifreskon të dhënat pas update
    const updatedLenda = await lendetRepository.findOne({ where: { id: lendaId } });

    console.log(`✓ Project deadline set for lenda ${lendaId} by profesor ${profesorId}: start=${start?.toISOString() ?? 'null'} end=${end?.toISOString() ?? 'null'}`);

    // Format dates as local strings for response (YYYY-MM-DDTHH:MM:SS)
    const formatLocalDate = (date: Date | undefined): string | null => {
      if (!date) return null;
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
    };

    res.json({
      message: "Afatet u përditësuan",
      lenda: {
        id: updatedLenda!.id,
        name: updatedLenda!.emriLendes,
        projectStartDate: formatLocalDate(updatedLenda!.projectStartDate),
        projectDeadline: formatLocalDate(updatedLenda!.projectDeadline),
        projectDeadlinesJson: updatedLenda!.projectDeadlinesJson ?? [],
      },
    });
  } catch (error) {
    console.error("Error setting project deadline:", error);
    res.status(500).json({ message: "Error setting project deadline", error: String(error) });
  }
});

// Update project grade (piket)
router.put("/:id/projekte/:projectId/piket", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const projectId = Number(req.params.projectId);
  const { piket } = req.body;

  if (Number.isNaN(profesorId) || Number.isNaN(projectId)) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  if (piket === undefined || piket === null || typeof piket !== 'number') {
    return res.status(400).json({ message: "Piket është e detyrueshme dhe duhet të jetë numër" });
  }

  try {
    const project = await dorezimProjektitRepository.findOne({
      where: { id: projectId },
      relations: ["student", "lenda"],
    });

    if (!project) {
      return res.status(404).json({ message: "Projekti nuk u gjet" });
    }

    const maxPoints = project.lenda?.projectMaxPoints ?? 100;

    if (piket < 0 || piket > maxPoints) {
      return res.status(400).json({ message: `Piket duhet të jenë ndërmjet 0 dhe ${maxPoints}` });
    }

    project.piket = piket;
    await dorezimProjektitRepository.save(project);

    console.log(`✓ Piket updated for project ${projectId} by profesor ${profesorId}: ${piket}`);

    res.json({
      message: "Piket u ruajtën me sukses",
      project: {
        id: project.id,
        piket: project.piket,
      }
    });
  } catch (error) {
    console.error("Error updating piket:", error);
    res.status(500).json({ message: "Error updating piket", error: String(error) });
  }
});

// Add feedback to a student submission
router.post("/:id/dorezime/:dorezimId/feedback", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const dorezimId = Number(req.params.dorezimId);
  const { feedbackText, vleresimi } = req.body;

  if (Number.isNaN(profesorId) || Number.isNaN(dorezimId)) {
    return res.status(400).json({ message: "Invalid IDs" });
  }

  if (!feedbackText || typeof feedbackText !== 'string' || feedbackText.trim().length === 0) {
    return res.status(400).json({ message: "Feedback text is required" });
  }

  try {
    // Gjej dorëzimin me ID të plotë relation load
    const dorezim = await dorezimiIdeeshRepository.findOne({
      where: { id: dorezimId },
      relations: ["student", "lenda"],
    });

    if (!dorezim) {
      return res.status(404).json({ message: "Dorëzimi nuk u gjet" });
    }

    console.log(`DEBUG: Saving feedback for submission ${dorezimId}`);
    console.log(`  - lendaId: ${dorezim.lendaId}`);
    console.log(`  - lenda loaded: ${dorezim.lenda ? 'yes' : 'no'}`);
    if (dorezim.lenda) {
      console.log(`  - lenda.profesorId: ${dorezim.lenda.profesorId}`);
      console.log(`  - param profesorId: ${profesorId}`);
    }

    // Update feedback - pa kontroll permission
    dorezim.feedbackText = feedbackText.trim();
    dorezim.feedbackDate = new Date();
    if (vleresimi) {
      dorezim.vleresimi = vleresimi;
    }

    await dorezimiIdeeshRepository.save(dorezim);

    console.log(`✓ Feedback added to submission ${dorezimId} by profesor ${profesorId}`);

    res.json({
      message: "Feedback u ruajt me sukses",
      feedback: {
        id: dorezim.id,
        feedbackText: dorezim.feedbackText,
        feedbackDate: dorezim.feedbackDate,
        vleresimi: dorezim.vleresimi,
      }
    });
  } catch (error) {
    console.error("Error adding feedback:", error);
    res.status(500).json({ message: "Error adding feedback", error: String(error) });
  }
});

// Get all profesoret
router.get("/", async (req: Request, res: Response) => {
  try {
    const profesoret = await profesorRepository.find();
    res.json(profesoret);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profesoret", error });
  }
});

// Get profesor by id 
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const profesor = await profesorRepository.findOneBy({ id: parseInt(req.params.id, 10) });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor not found" });
    }
    res.json(profesor);
  } catch (error) {
    res.status(500).json({ message: "Error fetching profesor", error });
  }
});

// Create profesor
router.post("/", async (req: Request, res: Response) => {
  try {
    const profesor = profesorRepository.create(req.body);
    const result = await profesorRepository.save(profesor);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating profesor", error });
  }
});

// Update profesor
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const profesor = await profesorRepository.findOneBy({ id: parseInt(req.params.id, 10) });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor not found" });
    }
    profesorRepository.merge(profesor, req.body);
    const result = await profesorRepository.save(profesor);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating profesor", error });
  }
});

// Delete profesor
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await profesorRepository.delete(parseInt(req.params.id, 10));
    if (result.affected === 0) {
      return res.status(404).json({ message: "Profesor not found" });
    }
    res.json({ message: "Profesor deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting profesor", error });
  }
});

// POST: Ngarko template për një lëndë (nga profesori)
router.post("/:id/lendet/:lendaId/template", uploadTemplate.single("file"), async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const lendaId = Number(req.params.lendaId);

  console.log(`[Template Upload] Profesor ID: ${profesorId}, Lenda ID: ${lendaId}`);

  if (Number.isNaN(profesorId) || Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "Invalid profesor or lenda ID" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Nuk u ngarkua asnjë file" });
  }

  try {
    const lenda = await lendetRepository.findOneBy({ id: lendaId });
    console.log(`[Template Upload] Lenda found:`, lenda ? `ID ${lenda.id} - ${lenda.emriLendes}` : 'NULL');

    if (!lenda) {
      return res.status(404).json({ message: "Lenda not found" });
    }

    // Fshij template-in e vjetër nëse ekziston
    if (lenda.templateFile) {
      const oldPath = path.resolve(process.cwd(), lenda.templateFile);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Ruaj path-in relativ
    const relativePath = path.relative(process.cwd(), req.file.path);

    // Përditëso lëndën me template-in e ri
    lenda.templateFile = relativePath;
    lenda.templateFileName = req.file.originalname;
    await lendetRepository.save(lenda);

    res.json({
      message: "Template u ngarkua me sukses!",
      fileName: lenda.templateFileName,
      hasTemplate: true
    });
  } catch (error) {
    res.status(500).json({ message: "Error uploading template", error });
  }
});

// GET: Merr informacionin e template-it për një lëndë
router.get("/:id/lendet/:lendaId/template", async (req: Request, res: Response) => {
  const lendaId = Number(req.params.lendaId);

  if (Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "Invalid lenda ID" });
  }

  try {
    const lenda = await lendetRepository.findOneBy({ id: lendaId });

    if (!lenda) {
      return res.status(404).json({ message: "Lenda not found" });
    }

    console.log(`[Template Info] Lenda ID: ${lendaId}, templateFile: ${lenda.templateFile}, templateFileName: ${lenda.templateFileName}`);

    if (!lenda.templateFile || !lenda.templateFileName) {
      return res.json({ hasTemplate: false });
    }

    res.json({
      hasTemplate: true,
      fileName: lenda.templateFileName
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching template info", error });
  }
});

// POST: Shto instruksione për një lëndë
router.post("/:id/lendet/:lendaId/instructions", uploadInstructions.array("files", 10), async (req: Request, res: Response) => {
  const lendaId = Number(req.params.lendaId);
  const content = (req.body?.content ?? "").toString();

  if (Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "Invalid lenda ID" });
  }

  try {
    const lenda = await lendetRepository.findOneBy({ id: lendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda not found" });
    }

    // Remove uploaded files (instructions are stored as text on lendet)
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    uploadedFiles.forEach((file) => {
      const absolutePath = path.resolve(process.cwd(), file.path);
      if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
      }
    });

    lenda.projectInstructions = content;
    await lendetRepository.save(lenda);

    res.json([{ id: lenda.id, title: "Instruksione", content: lenda.projectInstructions, createdAt: lenda.updatedAt, files: [] }]);
  } catch (error) {
    res.status(500).json({ message: "Error saving instructions", error: String(error) });
  }
});

// GET: Merr instruksionet për një lëndë
router.get("/:id/lendet/:lendaId/instructions", async (req: Request, res: Response) => {
  const lendaId = Number(req.params.lendaId);

  if (Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "Invalid lenda ID" });
  }

  try {
    const lenda = await lendetRepository.findOneBy({ id: lendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda not found" });
    }

    if (!lenda.projectInstructions) {
      return res.json([]);
    }

    res.json([
      {
        id: lenda.id,
        title: "Instruksione",
        content: lenda.projectInstructions,
        createdAt: lenda.updatedAt,
        files: [],
      },
    ]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching instructions", error: String(error) });
  }
});

// PUT: Modifiko instruksionet për një lëndë
router.put("/:id/lendet/:lendaId/instructions/:instructionId", uploadInstructions.array("files", 10), async (req: Request, res: Response) => {
  const instructionId = Number(req.params.instructionId);
  const content = (req.body?.content ?? "").toString();

  if (Number.isNaN(instructionId)) {
    return res.status(400).json({ message: "Invalid instruction ID" });
  }

  try {
    const lenda = await lendetRepository.findOneBy({ id: Number(req.params.lendaId) });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda not found" });
    }

    // Remove uploaded files (instructions are stored as text on lendet)
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    if (uploadedFiles.length > 0) {
      uploadedFiles.forEach((file) => {
        const absolutePath = path.resolve(process.cwd(), file.path);
        if (fs.existsSync(absolutePath)) {
          fs.unlinkSync(absolutePath);
        }
      });
    }

    lenda.projectInstructions = content;
    await lendetRepository.save(lenda);

    res.json({
      id: lenda.id,
      title: "Instruksione",
      content: lenda.projectInstructions,
      createdAt: lenda.updatedAt,
      files: [],
    });
  } catch (error) {
    res.status(500).json({ message: "Error updating instruction", error: String(error) });
  }
});

// DELETE: Fshij instruksionet për një lëndë
router.delete("/:id/lendet/:lendaId/instructions/:instructionId", async (req: Request, res: Response) => {
  const instructionId = Number(req.params.instructionId);

  if (Number.isNaN(instructionId)) {
    return res.status(400).json({ message: "Invalid instruction ID" });
  }

  try {
    const lenda = await lendetRepository.findOneBy({ id: Number(req.params.lendaId) });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda not found" });
    }

    lenda.projectInstructions = '';
    await lendetRepository.save(lenda);
    res.json({ message: "Instruction deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting instruction", error: String(error) });
  }
});

// DELETE: Fshij template-in për një lëndë
router.delete("/:id/lendet/:lendaId/template", async (req: Request, res: Response) => {
  const lendaId = Number(req.params.lendaId);

  if (Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "Invalid lenda ID" });
  }

  try {
    const lenda = await lendetRepository.findOneBy({ id: lendaId });

    if (!lenda) {
      return res.status(404).json({ message: "Lenda not found" });
    }

    if (!lenda.templateFile) {
      return res.status(404).json({ message: "Nuk ka template për këtë lëndë" });
    }

    // Fshij file-in
    const filePath = path.resolve(process.cwd(), lenda.templateFile);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Pastro fushat në databazë
    lenda.templateFile = null as any;
    lenda.templateFileName = null as any;
    await lendetRepository.save(lenda);

    console.log(`[Template Delete] Template u fshi për Lenda ID: ${lendaId}`);

    res.json({ message: "Template u fshi me sukses!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting template", error });
  }
});

// ============ EKSPORTI I REZULTATEVE TË PROJEKTEVE ============

// GET: Eksporto rezultatet e të gjitha projekteve në CSV
router.get("/:id/projekti/export-results", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  
  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  try {
    const profesor = await profesorRepository.findOneBy({ id: profesorId });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor not found" });
    }

    // Merr të gjitha lëndët e profesorit përmes mapping-ut
    const mappings = await mappingRepository.find({
      where: { profesorId },
      relations: ["lendet"],
    });

    if (!mappings || mappings.length === 0) {
      return res.status(404).json({ message: "Nuk keni asnjë lëndë të regjistruar" });
    }

    const lendaIds = mappings.map((m) => m.lendetId);

    // Merr të gjitha dorëzimet e projekteve për këto lëndë
    const dorezime = await dorezimProjektitRepository.find({
      where: lendaIds.map((lendaId) => ({ lenda: { id: lendaId } })),
      relations: ["student", "lenda"],
      order: { lenda: { id: "ASC" }, student: { mbiemri: "ASC" } },
    });

    if (!dorezime || dorezime.length === 0) {
      return res.status(404).json({ message: "Nuk ka dorëzime projektesh për lëndët tuaja" });
    }

    // Krijo CSV content
    const csvHeader = "Emri,Mbiemri,Emri i Projekti,Lënda,Pikët,Statusi,Data e Dorëzimit\n";
    
    const csvRows = dorezime.map((d) => {
      const emri = d.student?.emri || "N/A";
      const mbiemri = d.student?.mbiemri || "N/A";
      const emriProjekti = d.fileName || "N/A";
      const lenda = d.lenda?.emriLendes || "N/A";
      const piket = d.piket || 0;
      const statusi = d.statusi || "N/A";
      const dataDorezimit = d.createdAt 
        ? new Date(d.createdAt).toLocaleDateString("sq-AL")
        : "N/A";

      return `"${emri}","${mbiemri}","${emriProjekti}","${lenda}",${piket},"${statusi}","${dataDorezimit}"`;
    }).join("\n");

    const csvContent = csvHeader + csvRows;

    // Vendos headers për download
    const fileName = `rezultate-projektet-${Date.now()}.csv`;
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    
    // Shto BOM për UTF-8 që të shfaqen karakteret shqip saktë në Excel dhe dërgo CSV
    res.send("\uFEFF" + csvContent);
  } catch (error) {
    console.error("Error exporting results:", error);
    res.status(500).json({ message: "Error exporting results", error: String(error) });
  }
});

export default router;
