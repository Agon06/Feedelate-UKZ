import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Projekti } from "../../entities/Student/projekti";
import { Profesor } from "../../entities/Profesor/Profesor";
import { Lendet } from "../../entities/Student/Lendet";

const router = Router();
const projektiRepository = AppDataSource.getRepository(Projekti);
const profesorRepository = AppDataSource.getRepository(Profesor);
const lendetRepository = AppDataSource.getRepository(Lendet);

// Get all projects for a profesor (through their subjects)
router.get("/:profesorId", async (req: Request, res: Response) => {
  try {
    const profesorId = parseInt(req.params.profesorId, 10);
    // Get projects through subjects assigned to this profesor
    const projects = await projektiRepository.find({
      relations: ["profesor", "lenda", "lenda.profesor"],
      where: {
        lenda: {
          profesor: { id: profesorId }
        }
      }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
});

// Get project by ID
router.get("/:profesorId/:id", async (req: Request, res: Response) => {
  try {
    const profesorId = parseInt(req.params.profesorId, 10);
    const projectId = parseInt(req.params.id, 10);
    const project = await projektiRepository.findOne({
      where: { id: projectId },
      relations: ["professor", "lenda", "lenda.profesor"],
    });
    if (!project || project.lenda?.profesor?.id !== profesorId) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error });
  }
});

// Create project
router.post("/:profesorId", async (req: Request, res: Response) => {
  try {
    const profesorId = parseInt(req.params.profesorId, 10);
    const { emriProjekti, pershkrimiProjekti, deaAdline, lendaId, studentId } = req.body;

    const profesor = await profesorRepository.findOneBy({ id: profesorId });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor not found" });
    }

    const lenda = await lendetRepository.findOne({
      where: { id: lendaId, profesor: { id: profesorId } }
    });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda not found for this profesor" });
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
router.put("/:profesorId/:id", async (req: Request, res: Response) => {
  try {
    const profesorId = parseInt(req.params.profesorId, 10);
    const projectId = parseInt(req.params.id, 10);
    const { emriProjekti, pershkrimiProjekti, deaAdline, lendaId } = req.body;

    const project = await projektiRepository.findOne({
      where: { id: projectId },
      relations: ["lenda", "lenda.profesor"]
    });

    if (!project || project.lenda?.profesor?.id !== profesorId) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (lendaId) {
      const lenda = await lendetRepository.findOne({
        where: { id: lendaId, profesor: { id: profesorId } }
      });
      if (!lenda) {
        return res.status(404).json({ message: "Lenda not found for this profesor" });
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
router.delete("/:profesorId/:id", async (req: Request, res: Response) => {
  try {
    const profesorId = parseInt(req.params.profesorId, 10);
    const projectId = parseInt(req.params.id, 10);

    const project = await projektiRepository.findOne({
      where: { id: projectId },
      relations: ["lenda", "lenda.profesor"]
    });

    if (!project || project.lenda?.profesor?.id !== profesorId) {
      return res.status(404).json({ message: "Project not found" });
    }

    const result = await projektiRepository.delete(projectId);

    if (result.affected === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error });
  }
});

export default router;
