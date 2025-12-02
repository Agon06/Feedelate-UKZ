import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Admin } from "../../entities/Admin/Admin";

const router = Router();
const adminRepository = AppDataSource.getRepository(Admin);

// Get all admins     Nese eshte empty shkuraj nuk ka adminaaa

router.get("/", async (req: Request, res: Response) => {
    try {
        const admins = await adminRepository.find();
        if (admins.length === 0) {
            return res.status(404).json({ message: "No" });
        }
        res.json(admins);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admins", error });
    }
});


router.get("/hello", (req: Request, res: Response) => {
    res.send("Hello from Admin Routes!");
});

// Get admin by id
router.get("/:id", async (req: Request, res: Response) => {
    try {
        const admin = await adminRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json(admin);
    } catch (error) {
        res.status(500).json({ message: "Error fetching admin", error });
    }
});

// Create admin
router.post("/", async (req: Request, res: Response) => {
    try {
        const admin = adminRepository.create(req.body);
        const result = await adminRepository.save(admin);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: "Error creating admin", error });
    }
});

// Update admin
router.put("/:id", async (req: Request, res: Response) => {
    try {
        const admin = await adminRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        adminRepository.merge(admin, req.body);
        const result = await adminRepository.save(admin);
        res.json(result);
    } catch (error) {
        res.status(500).json({ message: "Error updating admin", error });
    }
});

// Delete admin
router.delete("/:id", async (req: Request, res: Response) => {
    try {
        const result = await adminRepository.delete(req.params.id);
        if (result.affected === 0) {
            return res.status(404).json({ message: "Admin not found" });
        }
        res.json({ message: "Admin deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting admin", error });
    }
});

export default router;
