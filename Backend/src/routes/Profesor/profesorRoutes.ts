import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Profesor } from "../../entities/Profesor/Profesor";

const router = Router();
const profesorRepository = AppDataSource.getRepository(Profesor);

// Get all profesoret
router.get("/", async (req: Request, res: Response) => {
    try {
        const profesoret = await profesorRepository.find();
        res.json(profesoret);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profesoret", error });
    }
});

// Merr profesorin me id 1
router.get("/merrDetyrat", async (req: Request, res: Response) => {
    try {
        const profesoriId = 2;
        const profesor = await profesorRepository.findOneBy({ id: profesoriId });
        if (!profesor) {
            return res.status(404).json({ message: "Profesor not found" });
        }
        res.json(profesor);
    } catch (error) {
        res.status(500).json({ message: "Error fetching profesor", error });
    }
});




// Get profesor by id
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const profesor = await profesorRepository.findOneBy({ id: parseInt(req.params.id) });
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
        const profesor = await profesorRepository.findOneBy({ id: parseInt(req.params.id) });
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
        const result = await profesorRepository.delete(req.params.id);
        if (result.affected === 0) {
            return res.status(404).json({ message: "Profesor not found" });
        }
        res.json({ message: "Profesor deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting profesor", error });
    }
});

export default router;
