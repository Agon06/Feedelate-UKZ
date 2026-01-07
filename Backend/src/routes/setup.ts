//ketu do e bejme nje route per setup te te dhenave fillestare nese eshte hera e pare qe ekzekutohet aplikacioni
import { Router } from "express";
import { AppDataSource } from "../data-source";
import { Lendet } from "../entities/Student/Lendet";
import { Student } from "../entities/Student/Student";
import { Profesor } from "../entities/Profesor/Profesor";
import { Lendetp } from "../entities/Profesor/Lendetp";

const router = Router();
// Route to setup initial data
router.post("/setup", async (req, res) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const lendetRepository = AppDataSource.getRepository(Lendet);

// Seed Profesor + Lendetp (professor curriculum subjects)
router.post("/setup/profesor", async (req, res) => {
  try {
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const profesorRepository = AppDataSource.getRepository(Profesor);
    const lendetpRepository = AppDataSource.getRepository(Lendetp);

    // Ensure a test profesor exists (id auto-generated)
    let profesor = await profesorRepository.findOne({ where: { email: "test.profesor@uni-gjilan.net" } });
    if (!profesor) {
      profesor = profesorRepository.create({
        emri: "Test",
        mbiemri: "Profesor",
        email: "test.profesor@uni-gjilan.net",
        password: "testHashedPassword",
        departamenti: "Informatikë",
        grada: "Profesor i Asociuar",
        telefoni: "+383 44 123 456",
      });
      profesor = await profesorRepository.save(profesor);
    }

    // Seed missing years 1, 2, and 3
    const seedYear = async (year, subjects) => {
      const existing = await lendetpRepository.find({ where: { viti: year } });
      if (existing.length > 0) {
        return false; // already seeded
      }
      for (const lendaData of subjects) {
        const lenda = lendetpRepository.create(lendaData);
        await lendetpRepository.save(lenda);
      }
      return true;
    };

    const year1Subjects = [
      { emriLendes: "Algoritmet dhe Strukturat e të Dhënave", semestri: 1, viti: 1, isZgjedhore: false },
      { emriLendes: "Programimi i Orientuar në Objekte", semestri: 1, viti: 1, isZgjedhore: false },
      { emriLendes: "Matematika Diskrete", semestri: 1, viti: 1, isZgjedhore: false },
      { emriLendes: "Bazat e të Dhënave", semestri: 2, viti: 1, isZgjedhore: false },
      { emriLendes: "Inxhinieria e Softuerit", semestri: 2, viti: 1, isZgjedhore: false }
    ];

    const year2Subjects = [
      { emriLendes: "Rrjetat Kompjuterike", semestri: 3, viti: 2, isZgjedhore: false },
      { emriLendes: "Siguria e Informacionit", semestri: 3, viti: 2, isZgjedhore: false },
      { emriLendes: "Inteligjenca Artificiale", semestri: 4, viti: 2, isZgjedhore: true },
      { emriLendes: "Machine Learning", semestri: 4, viti: 2, isZgjedhore: true }
    ];

    const year3Subjects = [
      { emriLendes: "Sistemet e Distribuuara", semestri: 5, viti: 3, isZgjedhore: false },
      { emriLendes: "Cloud Computing", semestri: 5, viti: 3, isZgjedhore: true },
      { emriLendes: "Aplikacione Mobile", semestri: 6, viti: 3, isZgjedhore: true }
    ];

    const seeded = [];
    if (await seedYear(1, year1Subjects)) seeded.push(1);
    if (await seedYear(2, year2Subjects)) seeded.push(2);
    if (await seedYear(3, year3Subjects)) seeded.push(3);

    res.status(201).json({
      message: seeded.length ? "Profesor data setup completed successfully." : "Profesor data already set up.",
      profesorId: profesor.id,
      seededYears: seeded
    });
  } catch (error) {
    console.error("Error during profesor setup:", error);
    res.status(500).json({ message: "Error during profesor setup.", error });
  }
});

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