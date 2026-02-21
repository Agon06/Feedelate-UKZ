import { AppDataSource } from "./data-source";
import { Student } from "./entities/Student/Student";
import { Lendet } from "./entities/Student/Lendet";

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected");

        const studentRepo = AppDataSource.getRepository(Student);
        const lendetRepo = AppDataSource.getRepository(Lendet);

        // Create a test student
        let student = await studentRepo.findOne({ where: { id: 1 } });

        if (!student) {
            student = studentRepo.create({
                emri: "Test",
                mbiemri: "Student",
                email: "test.student@uni-gjilan.net",
                academicYear: "2025/2026",
                roles: "student"
            });
            await studentRepo.save(student);
            console.log("✅ Student created with ID:", student.id);
        } else {
            console.log("✅ Student already exists with ID:", student.id);
        }

        // Create some test subjects
        const subjects = [
            { emri: "Programimi 1", semestri: 1, viti: 1, kredite: 6, isZgjedhore: false },
            { emri: "Matematika 1", semestri: 1, viti: 1, kredite: 6, isZgjedhore: false },
            { emri: "Algoritmet", semestri: 2, viti: 1, kredite: 6, isZgjedhore: false },
            { emri: "Bazat e të Dhënave", semestri: 3, viti: 2, kredite: 6, isZgjedhore: false },
            { emri: "Web Programming", semestri: 4, viti: 2, kredite: 6, isZgjedhore: false },
        ];

        for (const subj of subjects) {
            const existing = await lendetRepo.findOne({
                where: { emriLendes: subj.emri, semestri: subj.semestri }
            });

            if (!existing) {
                const lenda = lendetRepo.create({ ...subj, emriLendes: subj.emri });
                await lendetRepo.save(lenda);
                console.log(`✅ Subject created: ${subj.emri}`);
            } else {
                console.log(`✅ Subject already exists: ${subj.emri}`);
            }
        }

        console.log("\n✅ Seeding completed successfully!");
        await AppDataSource.destroy();
        process.exit(0);
    } catch (error) {
        console.error("❌ Error during seeding:", error);
        process.exit(1);
    }
}

seed();
