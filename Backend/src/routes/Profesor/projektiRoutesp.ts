import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Projektip } from "../../entities/Profesor/projektip";
import { Profesor } from "../../entities/Profesor/Profesor";
import { Lendetp } from "../../entities/Profesor/Lendetp";

const router = Router();
const projektipRepository = AppDataSource.getRepository(Projektip);
const profesorRepository = AppDataSource.getRepository(Profesor);
const lendetpRepository = AppDataSource.getRepository(Lendetp);

// Get all projects for a profesor
router.get("/:profesorId", async (req: Request, res: Response) => {
  try {
    const profesorId = parseInt(req.params.profesorId, 10);
    const projects = await projektipRepository.find({
      where: { profesorId },
      relations: ["profesor", "lenda"],
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
    const project = await projektipRepository.findOneBy({
      id: projectId,
      profesorId,
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
router.post("/:profesorId", async (req: Request, res: Response) => {
  try {
    const profesorId = parseInt(req.params.profesorId, 10);
    const { emriProjekti, pershkrimiProjekti, deaAdline, lendaId } = req.body;

    const profesor = await profesorRepository.findOneBy({ id: profesorId });
    if (!profesor) {
      return res.status(404).json({ message: "Profesor not found" });
    }

    const lenda = await lendetpRepository.findOneBy({ id: lendaId });
    if (!lenda) {
      return res.status(404).json({ message: "Lenda not found" });
    }

    const project = projektipRepository.create({
      emriProjekti,
      pershkrimiProjekti,
      deaAdline,
      profesorId,
      lendaId,
    });

    const result = await projektipRepository.save(project);
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

    const project = await projektipRepository.findOneBy({
      id: projectId,
      profesorId,
    });

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (lendaId) {
      const lenda = await lendetpRepository.findOneBy({ id: lendaId });
      if (!lenda) {
        return res.status(404).json({ message: "Lenda not found" });
      }
      project.lendaId = lendaId;
    }

    project.emriProjekti = emriProjekti || project.emriProjekti;
    project.pershkrimiProjekti = pershkrimiProjekti || project.pershkrimiProjekti;
    project.deaAdline = deaAdline || project.deaAdline;

    const result = await projektipRepository.save(project);
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

    const result = await projektipRepository.delete({
      id: projectId,
      profesorId,
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
