import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Student } from "../../entities/Student/Student";

const router = Router();
const studentRepository = AppDataSource.getRepository(Student);

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
    const student = await studentRepository.findOneBy({ id: parseInt(req.params.id) });
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

// Update student
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const student = await studentRepository.findOneBy({ id: parseInt(req.params.id) });
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
    const result = await studentRepository.delete(req.params.id);
    if (result.affected === 0) {
      return res.status(404).json({ message: "Student not found" });
    }
    res.json({ message: "Student deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting student", error });
  }
});

export default router;
