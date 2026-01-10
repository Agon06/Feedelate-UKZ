import { Router, Request, Response } from "express";
import { FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../../data-source";
import multer from "multer";
import path from "path";
import fs from "fs";
//ketu thirren kejt tabelat qe ti ki me punu qofte me njo ose dy ose tri ose...
import { Profesor } from "../../entities/Profesor/Profesor";
import { Lendetp } from "../../entities/Profesor/Lendetp";
import { Idetep } from "../../entities/Profesor/Idetep";
import { DorezimiIdesp } from "../../entities/Profesor/dorezimiIdesp";
import { Projektip } from "../../entities/Profesor/projektip";
import { DorezimiIdes } from "../../entities/Student/dorezimiIdes";
import { Student } from "../../entities/Student/Student";
import { Lendet } from "../../entities/Student/Lendet";

const router = Router();
const profesorRepository = AppDataSource.getRepository(Profesor);
const lendetpRepository = AppDataSource.getRepository(Lendetp);
const idetepRepository = AppDataSource.getRepository(Idetep);
const dorezimpRepository = AppDataSource.getRepository(DorezimiIdesp);
const projektipRepository = AppDataSource.getRepository(Projektip);
const dorezimiStudentRepository = AppDataSource.getRepository(DorezimiIdes);
const studentRepository = AppDataSource.getRepository(Student);
const lendetRepository = AppDataSource.getRepository(Lendet);

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

const formatProfesorSummary = (profesor: Profesor) => ({
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
router.get("/:id/dashboard", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  try {
    const profesor = await profesorRepository.findOneBy({ id: profesorId });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor not found" });
    }

    const lendet = await lendetpRepository.find();
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
      profesor: formatProfesorSummary(profesor),
      years,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
});

// Curriculum view per year
router.get("/:id/lendet/:yearId", async (req: Request, res: Response) => {
  const profesorId = Number(req.params.id);
  const yearParam = Number(req.params.yearId);
  if (Number.isNaN(profesorId)) {
    return res.status(400).json({ message: "Profesor id is invalid" });
  }

  if (Number.isNaN(yearParam) || yearParam < 1) {
    return res.status(400).json({ message: "Parametri yearId duhet te jete numer pozitiv" });
  }

  try {
    const profesor = await profesorRepository.findOneBy({ id: profesorId });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor not found" });
    }

    const lendet = await lendetpRepository.find({
      where: { viti: yearParam },
      order: { semestri: "ASC", emriLendes: "ASC" },
    });

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
        name: lenda.emriLendes,
        isElective: lenda.isZgjedhore,
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
      profesor: formatProfesorSummary(profesor),
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

    const where: FindOptionsWhere<Idetep> = {
      profesor: { id: profesorId },
      ...(lendaId ? { lenda: { id: lendaId } } : {}),
    };

    const ideas = await idetepRepository.find({
      where,
      relations: ["lenda"],
      order: { createdAt: "DESC" },
    });

    res.json(
      ideas.map((idea) => ({
        id: idea.id,
        title: idea.titulli,
        shorthand: idea.shkurtesa,
        subject: idea.lenda
          ? { id: idea.lenda.id, name: idea.lenda.emriLendes }
          : null,
        createdAt: idea.createdAt,
      }))
    );
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

    const lenda = await lendetpRepository.findOneBy({ id: parsedLendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    const idea = idetepRepository.create({
      titulli: titulli.trim(),
      shkurtesa: shkurtesa.trim(),
      profesor,
      lenda,
    });

    const savedIdea = await idetepRepository.save(idea);

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

// Upload dorezim (Word file saved to disk)
router.post("/:id/dorezime", upload.single("file"), async (req: Request, res: Response) => {
  console.log("=== UPLOAD ENDPOINT HIT ===");
  console.log("Params:", req.params);
  console.log("Body:", req.body);
  console.log("File:", req.file ? { name: req.file.originalname, size: req.file.size, path: req.file.path } : "NO FILE");
  
  const profesorId = Number(req.params.id);
  const { lendaId } = req.body;

  console.log("Profesor ID:", profesorId, "Lenda ID:", lendaId);

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
    const lenda = await lendetpRepository.findOneBy({ id: parsedLendaId });
    if (!lenda) {
      console.log("ERROR: Lenda not found");
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    console.log("Found lenda:", lenda.emriLendes);

    // Get relative path from uploads folder
    const filePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, "/");
    console.log("File path to save:", filePath);

    const record = dorezimpRepository.create({
      profesor,
      lenda,
      fileDorezimi: filePath,
      fileName: req.file.originalname,
      isShabllon: false,
    });

    console.log("Created record object");
    const saved = await dorezimpRepository.save(record);
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

    const lenda = await lendetpRepository.findOneBy({ id: lendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    // Find template (isShabllon: true)
    const template = await dorezimpRepository.findOne({
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

    const lenda = await lendetpRepository.findOneBy({ id: lendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    const submission = await dorezimpRepository.findOne({
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

    const lenda = await lendetpRepository.findOneBy({ id: lendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    // Fetch all student submissions for this subject
    const submissions = await dorezimiStudentRepository.find({
      where: {
        lenda: { id: lendaId },
        isShabllon: false,
      },
      relations: ["student", "lenda"],
      order: { createdAt: "DESC" },
    });

    const submissionsData = submissions.map((sub) => ({
      id: sub.id,
      student: {
        id: sub.student.id,
        emri: sub.student.emri,
        mbiemri: sub.student.mbiemri,
        fullName: `${sub.student.emri} ${sub.student.mbiemri}`.trim(),
      },
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

  if (Number.isNaN(profesorId) || Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "Invalid profesor or lenda ID" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "Nuk u ngarkua asnjë file" });
  }

  try {
    const lenda = await lendetRepository.findOneBy({ id: lendaId });

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
    lenda.templateFile = undefined;
    lenda.templateFileName = undefined;
    await lendetRepository.save(lenda);

    res.json({ message: "Template u fshi me sukses!" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting template", error });
  }
});

export default router;
