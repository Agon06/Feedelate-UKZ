//ketu do e bejme nje route per setup te te dhenave fillestare nese eshte hera e pare qe ekzekutohet aplikacioni
import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Lendet } from "../entities/Student/Lendet";
import { Student } from "../entities/Student/Student";

const router = Router();
// Route to setup initial data
router.post("/setup", async (req, res) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const lendetRepository = AppDataSource.getRepository(Lendet);
    const studentRepository = AppDataSource.getRepository(Student);

    // Check if initial data already exists
    const existingLendet = await lendetRepository.find();
    if (existingLendet.length > 0) {
        return res.status(400).json({ message: "Initial data already set up." });
    }
    // Create initial Lendet
    const lendetData = [
      { emriLendes: "Matematika", shkurtesa: "MAT" },
      { emriLendes: "Inxhinieri Software", shkurtesa: "ISW" },
      { emriLendes: "Bazat e te dhenave", shkurtesa: "BD" },
      { emriLendes: "Sistemet Operative", shkurtesa: "SO" },
      { emriLendes: "Rrjetet Kompjuterike", shkurtesa: "RK" },
    ]; 
    for (const lendaData of lendetData) {
        const lenda = lendetRepository.create({
            emriLendes: lendaData.emriLendes,
            semestri: 1,
            viti: 1,
            isZgjedhore: false,
        });
        await lendetRepository.save(lenda);
    }   
    // Create an initial Student
    const initialStudent = studentRepository.create({
      emri: "Admin",
      mbiemri: "User",
      email: "admin@example.com",
        password: "admin123",
    nrIdCard: "ID123456",
    });
    await studentRepository.save(initialStudent);
    res.status(201).json({ message: "Initial data setup completed successfully." });
  } catch (error) {
    console.error("Error during setup:", error);
    res.status(500).json({ message: "Error during setup.", error });
  } 
});

export default router;