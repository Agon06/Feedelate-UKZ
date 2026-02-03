import { Router, Request, Response } from "express";
import { AppDataSource } from "../../data-source";
import { Admin } from "../../entities/Admin/Admin";
import { Student } from "../../entities/Student/Student";
import { Profesor } from "../../entities/Profesor/Profesor";
import { Lendet } from "../../entities/Student/Lendet";
import { ProfesorLendetMapping } from "../../entities/Student/ProfesorLendetMapping";

const router = Router();
const adminRepository = AppDataSource.getRepository(Admin);
const studentRepository = AppDataSource.getRepository(Student);
const profesorRepository = AppDataSource.getRepository(Profesor);
const lendetRepository = AppDataSource.getRepository(Lendet);
const mappingRepository = AppDataSource.getRepository(ProfesorLendetMapping);

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
            select: ["id", "emri", "mbiemri", "email", "roles", "createdAt"]
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
        const { emri, mbiemri, email, roles } = req.body;

        // Try to find in Profesor table first
        let profesor = await profesorRepository.findOneBy({ id: parseInt(id) });
        
        if (profesor) {
            // Update Profesor record
            if (emri) profesor.emri = emri;
            if (mbiemri) profesor.mbiemri = mbiemri;
            if (email) profesor.email = email;
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

// ========== LENDET ROUTES (must be BEFORE /:id route to avoid route conflicts) ==========

// Get all lendet (subjects)
router.get("/lendet/all", async (req: Request, res: Response) => {
    try {
        const lendet = await lendetRepository.find({
            order: {
                viti: "ASC",
                semestri: "ASC"
            }
        });
        res.json(lendet);
    } catch (error) {
        console.error("Error fetching lendet:", error);
        res.status(500).json({ message: "Error fetching lendet", error });
    }
});

// Create lendet (register a new subject)
router.post("/lendet", async (req: Request, res: Response) => {
    try {
        const { emriLendes, viti, semestri, isZgjedhore } = req.body;

        // Validate required fields
        if (!emriLendes || viti === undefined || semestri === undefined || isZgjedhore === undefined) {
            return res.status(400).json({ 
                message: "Missing required fields: emriLendes, viti, semestri, isZgjedhore" 
            });
        }

        const lendet = lendetRepository.create({
            emriLendes,
            viti: parseInt(viti),
            semestri: parseInt(semestri),
            isZgjedhore: isZgjedhore === true || isZgjedhore === "true"
        });

        const result = await lendetRepository.save(lendet);
        res.status(201).json(result);
    } catch (error) {
        console.error("Error creating lendet:", error);
        res.status(500).json({ message: "Error creating lendet", error });
    }
});

// Get lendet by year
router.get("/lendet/by-year/:viti", async (req: Request, res: Response) => {
    try {
        const viti = parseInt(req.params.viti);
        console.log(`Fetching lendet for viti: ${viti}`);

        const lendet = await lendetRepository.find({
            where: { viti },
            order: {
                semestri: "ASC"
            }
        });

        console.log(`Found ${lendet.length} lendet for viti ${viti}`);

        // Get all mappings to include profesor assignments
        const mappings = await mappingRepository.find();
        console.log(`Total mappings: ${mappings.length}`);

        const mappingMap = new Map();
        mappings.forEach(m => {
            mappingMap.set(m.lendetId, m.profesorId);
        });

        // Add profesorId from mapping to each lendet
        const lendetWithAssignments = lendet.map(l => ({
            ...l,
            profesorId: mappingMap.get(l.id) || null
        }));

        console.log(`Returning ${lendetWithAssignments.length} lendet with assignments`);
        res.json(lendetWithAssignments);
    } catch (error) {
        console.error("Error fetching lendet by year:", error);
        res.status(500).json({ message: "Error fetching lendet by year", error });
    }
});

// ========== ADMIN ROUTES ==========

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

// ========== ASSIGN LENDET TO PROFESOR ==========
// Assign subjects to a professor using mapping table
router.post("/assign-lendet/:profesorId", async (req: Request, res: Response) => {
    try {
        const profesorId = parseInt(req.params.profesorId);
        const { lendetIds } = req.body; // Array of subject IDs

        if (!lendetIds || !Array.isArray(lendetIds)) {
            return res.status(400).json({ message: "lendetIds must be an array" });
        }

        // Verify profesor exists (can be in either profesoret or studentet table)
        let profesorName = 'Unknown';
        const profesor = await profesorRepository.findOneBy({ id: profesorId });
        if (profesor) {
            profesorName = `${profesor.emri} ${profesor.mbiemri}`;
        } else {
            const student = await studentRepository.findOneBy({ id: profesorId });
            if (student) {
                profesorName = `${student.emri} ${student.mbiemri}`;
            } else {
                return res.status(404).json({ message: `Profesor/Student with id ${profesorId} not found` });
            }
        }

        console.log(`Assigning ${lendetIds.length} lendet to profesor ${profesorId} (${profesorName})`);

        // First, delete all existing assignments for this profesor
        await mappingRepository.delete({ profesorId });
        console.log(`Cleared previous assignments for profesor ${profesorId}`);

        // Then create new assignments
        let successCount = 0;
        const failedIds = [];
        
        for (const lendetId of lendetIds) {
            try {
                const lendet = await lendetRepository.findOneBy({ id: lendetId });
                if (!lendet) {
                    console.warn(`Lendet with id ${lendetId} not found`);
                    failedIds.push(lendetId);
                    continue;
                }

                // Create mapping entry
                const mapping = mappingRepository.create({
                    profesorId,
                    lendetId
                });
                await mappingRepository.save(mapping);
                console.log(`Created mapping: profesor ${profesorId} -> lendet ${lendetId}`);
                successCount++;
            } catch (err) {
                console.error(`Error assigning lendet ${lendetId}:`, err);
                failedIds.push(lendetId);
            }
        }

        res.json({
            message: `Successfully assigned ${successCount} lendet to profesor ${profesorName}`,
            assignedCount: successCount,
            failedIds: failedIds.length > 0 ? failedIds : undefined
        });
    } catch (error) {
        console.error("Error assigning lendet:", error);
        res.status(500).json({ message: "Error assigning lendet", error });
    }
});

// Get assignments for a professor
router.get("/profesor-assignments/:profesorId", async (req: Request, res: Response) => {
    try {
        const profesorId = parseInt(req.params.profesorId);

        if (Number.isNaN(profesorId)) {
            return res.status(400).json({ message: "Profesor id is invalid" });
        }

        // Get mappings for this profesor
        const mappings = await mappingRepository.find({ where: { profesorId } });
        
        console.log(`Found ${mappings.length} assignments for profesor ${profesorId}`);

        res.json({
            profesorId,
            assignedLendetIds: mappings.map(m => m.lendetId)
        });
    } catch (error) {
        console.error("Error fetching profesor assignments:", error);
        res.status(500).json({ message: "Error fetching profesor assignments", error });
    }
});

export default router;
