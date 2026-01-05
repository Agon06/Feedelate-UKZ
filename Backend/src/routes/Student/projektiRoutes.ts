import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Projekti } from "../../entities/Student/projekti";
import { Student } from "../../entities/Student/Student";
import { Lendet } from "../../entities/Student/Lendet";

const router = Router();
const projektiRepository = AppDataSource.getRepository(Projekti);
const studentRepository = AppDataSource.getRepository(Student);
const lendeRepository = AppDataSource.getRepository(Lendet);

// Get all projects for a student
router.get("/:studentId", async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const projects = await projektiRepository.find({
      where: { studentId },
      relations: ["student", "lenda"],
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
});

// Get project by ID
router.get("/:studentId/:id", async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const projectId = parseInt(req.params.id, 10);
    const project = await projektiRepository.findOneBy({
      id: projectId,
      studentId,
    });
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error });
  }
});

// Create project
router.post("/:studentId", async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const { emriProjekti, pershkrimiProjekti, deaAdline, lendaId } = req.body;

    const student = await studentRepository.findOneBy({ id: studentId });
    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const lenda = await lendeRepository.findOneBy({ id: lendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda not found" });
    }

    const project = projektiRepository.create({
      emriProjekti,
      pershkrimiProjekti,
      deaAdline,
      studentId,
      lendaId,
    });

    const result = await projektiRepository.save(project);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
});

// Update project
router.put("/:studentId/:id", async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const projectId = parseInt(req.params.id, 10);
    const { emriProjekti, pershkrimiProjekti, deaAdline, lendaId } = req.body;

    const project = await projektiRepository.findOneBy({
      id: projectId,
      studentId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (lendaId) {
      const lenda = await lendeRepository.findOneBy({ id: lendaId });
      if (!lenda) {
        return res.status(404).json({ message: "Lenda not found" });
      }
      project.lendaId = lendaId;
    }

    project.emriProjekti = emriProjekti || project.emriProjekti;
    project.pershkrimiProjekti = pershkrimiProjekti || project.pershkrimiProjekti;
    project.deaAdline = deaAdline || project.deaAdline;

    const result = await projektiRepository.save(project);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error });
  }
});

// Delete project
router.delete("/:studentId/:id", async (req: Request, res: Response) => {
  try {
    const studentId = parseInt(req.params.studentId, 10);
    const projectId = parseInt(req.params.id, 10);

    const result = await projektiRepository.delete({
      id: projectId,
      studentId,
    });

    if (result.affected === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error });
  }
});

export default router;
