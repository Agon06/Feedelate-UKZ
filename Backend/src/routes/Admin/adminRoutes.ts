import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Admin } from "../../entities/Admin/Admin";
import { Student } from "../../entities/Student/Student";
import { Profesor } from "../../entities/Profesor/Profesor";

const router = Router();
const adminRepository = AppDataSource.getRepository(Admin);
const studentRepository = AppDataSource.getRepository(Student);
const profesorRepository = AppDataSource.getRepository(Profesor);

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

// Get all students
router.get("/students/all", async (req: Request, res: Response) => {
    try {
        const students = await studentRepository.find({
            select: ["id", "emri", "mbiemri", "email", "nrIdCard", "roles", "createdAt"]
        });
        res.json(students);
    } catch (error) {
        console.error("Error fetching students:", error);
        res.status(500).json({ message: "Error fetching students", error });
    }
});

// Get student by id
router.get("/students/:id", async (req: Request, res: Response) => {
    try {
        const student = await studentRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        res.json(student);
    } catch (error) {
        console.error("Error fetching student:", error);
        res.status(500).json({ message: "Error fetching student", error });
    }
});

// Update student
router.put("/students/:id", async (req: Request, res: Response) => {
    try {
        const student = await studentRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        const { emri, mbiemri, email, nrIdCard, roles } = req.body;
        if (emri) student.emri = emri;
        if (mbiemri) student.mbiemri = mbiemri;
        if (email) student.email = email;
        if (nrIdCard) student.nrIdCard = nrIdCard;
        if (roles) student.roles = roles;
        const result = await studentRepository.save(student);
        res.json(result);
    } catch (error) {
        console.error("Error updating student:", error);
        res.status(500).json({ message: "Error updating student", error });
    }
});

// Get all professors (anyone with profesor role)
router.get("/profesors/all", async (req: Request, res: Response) => {
    try {
        // Get all from Profesor table
        const profesores = await profesorRepository.find({
            select: ["id", "emri", "mbiemri", "email", "departamenti", "grada", "telefoni", "roles", "createdAt"]
        });

        // Get all from Student table and filter by profesor role
        const allStudents = await studentRepository.find();
        const studentProfesores = allStudents
            .filter(student => {
                try {
                    const roles = typeof student.roles === 'string' ? JSON.parse(student.roles) : student.roles;
                    return Array.isArray(roles) && roles.includes('profesor');
                } catch {
                    return false;
                }
            })
            .map(student => ({
                id: student.id,
                emri: student.emri,
                mbiemri: student.mbiemri,
                email: student.email,
                departamenti: null,
                grada: null,
                telefoni: null,
                roles: student.roles,
                createdAt: student.createdAt
            }));

        // Combine both lists
        const allProfesors = [...profesores, ...studentProfesores];
        
        // Deduplicate by id (in case someone appears in both tables)
        const seen = new Set();
        const unique = allProfesors.filter(prof => {
            if (seen.has(prof.id)) return false;
            seen.add(prof.id);
            return true;
        });

        res.json(unique);
    } catch (error) {
        console.error("Error fetching professors:", error);
        res.status(500).json({ message: "Error fetching professors", error });
    }
});

// Get profesor by id
router.get("/profesors/:id", async (req: Request, res: Response) => {
    try {
        const profesor = await profesorRepository.findOneBy({ id: parseInt(req.params.id) });
        if (!profesor) {
            return res.status(404).json({ message: "Profesor not found" });
        }
        res.json(profesor);
    } catch (error) {
        console.error("Error fetching profesor:", error);
        res.status(500).json({ message: "Error fetching profesor", error });
    }
});

// Update profesor
router.put("/profesors/:id", async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { emri, mbiemri, email, departamenti, grada, telefoni, roles } = req.body;

        // Try to find in Profesor table first
        let profesor = await profesorRepository.findOneBy({ id: parseInt(id) });
        
        if (profesor) {
            // Update Profesor record
            if (emri) profesor.emri = emri;
            if (mbiemri) profesor.mbiemri = mbiemri;
            if (email) profesor.email = email;
            if (departamenti) profesor.departamenti = departamenti;
            if (grada) profesor.grada = grada;
            if (telefoni) profesor.telefoni = telefoni;
            if (roles) profesor.roles = roles;
            const result = await profesorRepository.save(profesor);
            return res.json(result);
        }

        // If not found in Profesor table, try Student table
        const student = await studentRepository.findOneBy({ id: parseInt(id) });
        if (student) {
            // Update Student record
            if (emri) student.emri = emri;
            if (mbiemri) student.mbiemri = mbiemri;
            if (email) student.email = email;
            if (roles) student.roles = roles;
            const result = await studentRepository.save(student);
            return res.json(result);
        }

        return res.status(404).json({ message: "User not found" });
    } catch (error) {
        console.error("Error updating profesor:", error);
        res.status(500).json({ message: "Error updating profesor", error });
    }
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
