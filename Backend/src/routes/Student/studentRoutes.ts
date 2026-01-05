import { Router, Request, Response } from "express";
import { FindOptionsWhere } from "typeorm";
import { AppDataSource } from "../../data-source";
import multer from "multer";
import path from "path";
import fs from "fs";
//ketu thirren kejt tabelat qe ti ki me punu qofte me njo ose dy ose tri ose...
import { Student } from "../../entities/Student/Student";
import { Lendet } from "../../entities/Student/Lendet";
import { Idete } from "../../entities/Student/Idete";
import { DorezimiIdes } from "../../entities/Student/dorezimiIdes";
import { Projekti } from "../../entities/Student/projekti"; 








const router = Router();
const studentRepository = AppDataSource.getRepository(Student);
const lendeRepository = AppDataSource.getRepository(Lendet);
const ideaRepository = AppDataSource.getRepository(Idete);
const dorezimRepository = AppDataSource.getRepository(DorezimiIdes);
const projektiRepository = AppDataSource.getRepository(Projekti);

//e thirr repositorin e testi


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

const formatStudentSummary = (student: Student) => ({
  id: student.id,
  emri: student.emri,
  mbiemri: student.mbiemri,
  fullName: `${student.emri} ${student.mbiemri}`.trim(),
  email: student.email,
});

const getYearLabel = (yearNumber: number) => {
  const roman = ["I", "II", "III", "IV", "V", "VI"];
  return `Viti ${roman[yearNumber - 1] ?? yearNumber}`;
};

// Dashboard snapshot for a student
router.get("/:id/dashboard", async (req: Request, res: Response) => {
  const studentId = Number(req.params.id);
  if (Number.isNaN(studentId)) {
    return res.status(400).json({ message: "Student id is invalid" });
  }

  try {
    const student = await studentRepository.findOneBy({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const lendet = await lendeRepository.find();
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
      student: formatStudentSummary(student),
      years,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
});

// Curriculum view per year
router.get("/:id/lendet/:yearId", async (req: Request, res: Response) => {
  const studentId = Number(req.params.id);
  const yearParam = Number(req.params.yearId);
  if (Number.isNaN(studentId)) {
    return res.status(400).json({ message: "Student id is invalid" });
  }

  if (Number.isNaN(yearParam) || yearParam < 1) {
    return res.status(400).json({ message: "Parametri yearId duhet te jete numer pozitiv" });
  }

  try {
    const student = await studentRepository.findOneBy({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const lendet = await lendeRepository.find({
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
      student: formatStudentSummary(student),
      year: { id: String(yearParam), title: getYearLabel(yearParam) },
      semesters: semestersPayload,
      electives,
      selectedElectives: [],
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching lendet", error });
  }
});

// Idea listing per student (optional filter by lenda)
router.get("/:id/idet", async (req: Request, res: Response) => {
  const studentId = Number(req.params.id);
  const lendaId = req.query.lendaId ? Number(req.query.lendaId) : undefined;

  if (Number.isNaN(studentId)) {
    return res.status(400).json({ message: "Student id is invalid" });
  }

  if (lendaId !== undefined && Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "lendaId duhet te jete numer" });
  }

  try {
    const student = await studentRepository.findOneBy({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const where: FindOptionsWhere<Idete> = {
      student: { id: studentId },
      ...(lendaId ? { lenda: { id: lendaId } } : {}),
    };

    const ideas = await ideaRepository.find({
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

// Create idea for student/lenda
router.post("/:id/idet", async (req: Request, res: Response) => {
  const studentId = Number(req.params.id);
  const { lendaId, titulli, shkurtesa } = req.body;

  if (Number.isNaN(studentId)) {
    return res.status(400).json({ message: "Student id is invalid" });
  }

  if (!lendaId || !titulli || !shkurtesa) {
    return res.status(400).json({ message: "lendaId, titulli dhe shkurtesa jane te detyrueshme" });
  }

  const parsedLendaId = Number(lendaId);
  if (Number.isNaN(parsedLendaId)) {
    return res.status(400).json({ message: "lendaId duhet te jete numer" });
  }

  try {
    const student = await studentRepository.findOneBy({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const lenda = await lendeRepository.findOneBy({ id: parsedLendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    const idea = ideaRepository.create({
      titulli: titulli.trim(),
      shkurtesa: shkurtesa.trim(),
      student,
      lenda,
    });

    const savedIdea = await ideaRepository.save(idea);

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
  
  const studentId = Number(req.params.id);
  const { lendaId } = req.body;

  console.log("Student ID:", studentId, "Lenda ID:", lendaId);

  if (Number.isNaN(studentId)) {
    console.log("ERROR: Student id is invalid");
    return res.status(400).json({ message: "Student id is invalid" });
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
    console.log("Looking for student ID:", studentId);
    const student = await studentRepository.findOneBy({ id: studentId });
    if (!student) {
      console.log("ERROR: Student not found");
      return res.status(404).json({ message: "Student not found" });
    }

    console.log("Found student:", student.emri);
    const lenda = await lendeRepository.findOneBy({ id: parsedLendaId });
    if (!lenda) {
      console.log("ERROR: Lenda not found");
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    console.log("Found lenda:", lenda.emriLendes);

    // Get relative path from uploads folder
    const filePath = path.relative(process.cwd(), req.file.path).replace(/\\/g, "/");
    console.log("File path to save:", filePath);

    const record = dorezimRepository.create({
      student,
      lenda,
      fileDorezimi: filePath,
      fileName: req.file.originalname,
      isShabllon: false,
    });

    console.log("Created record object");
    const saved = await dorezimRepository.save(record);
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
  const studentId = Number(req.params.id);
  const lendaId = req.query.lendaId ? Number(req.query.lendaId) : undefined;

  if (Number.isNaN(studentId)) {
    return res.status(400).json({ message: "Student id is invalid" });
  }

  if (!lendaId || Number.isNaN(lendaId)) {
    return res.status(400).json({ message: "lendaId eshte i detyrueshem" });
  }

  try {
    const student = await studentRepository.findOneBy({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const lenda = await lendeRepository.findOneBy({ id: lendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda nuk u gjet" });
    }

    // Find template (isShabllon: true)
    const template = await dorezimRepository.findOne({
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

// Get all studentet
router.get("/", async (req: Request, res: Response) => {
  try {
    const studentet = await studentRepository.find();
    res.json(studentet);
  } catch (error) {
    res.status(500).json({ message: "Error fetching studentet", error });
  }
});

// Get student by id 
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const student = await studentRepository.findOneBy({ id: parseInt(req.params.id, 10) });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student", error });
  }
});  

// Create student
router.post("/", async (req: Request, res: Response) => {
  try {
    const student = studentRepository.create(req.body);
    const result = await studentRepository.save(student);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating student", error });
  }
});


//router.get i merrr prej db, router.post i inserton n db, router. put/patch i updeton, dhe router.delete i fshin
//ktu krijohen api  endpoint per me i menaxhu db. 















// Update student
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const student = await studentRepository.findOneBy({ id: parseInt(req.params.id, 10) });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }
    studentRepository.merge(student, req.body);
    const result = await studentRepository.save(student);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating student", error });
  }
});

// Delete student
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const result = await studentRepository.delete(parseInt(req.params.id, 10));
    if (result.affected === 0) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student", error });
  }
});


export default router;