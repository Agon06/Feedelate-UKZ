import { AppDataSource } from "./data-source";
import { ProfesorLendetMapping } from "./entities/Student/ProfesorLendetMapping";
import { Lendet } from "./entities/Student/Lendet";

async function assignAllSubjects() {
    try {
        await AppDataSource.initialize();
        console.log("✅ Database connected");

        const mappingRepo = AppDataSource.getRepository(ProfesorLendetMapping);
        const lendetRepo = AppDataSource.getRepository(Lendet);

        // Get all subjects
        const allLendet = await lendetRepo.find();
        console.log(`\n📚 Found ${allLendet.length} subjects in database`);

        if (allLendet.length === 0) {
            console.log("❌ No subjects found. Please add subjects first.");
            await AppDataSource.destroy();
            process.exit(1);
        }

        const profesorId = 1; // agon osmani
        const academicYear = "2025/2026";

        console.log(`\n🎯 Assigning all subjects to profesor ${profesorId} for academic year ${academicYear}`);

        // Delete existing mappings for this profesor and academic year
        await mappingRepo.delete({ profesorId, academicYear });
        console.log("🗑️  Cleared previous assignments");

        // Create mappings for all subjects
        let count = 0;
        for (const lenda of allLendet) {
            const mapping = mappingRepo.create({
                profesorId,
                lendetId: lenda.id,
                academicYear
            });
            await mappingRepo.save(mapping);
            console.log(`  ✓ Assigned: ${lenda.emriLendes} (Viti ${lenda.viti}, Semestri ${lenda.semestri})`);
            count++;
        }

        console.log(`\n✅ Successfully assigned ${count} subjects to profesor ${profesorId}`);

        // Verify mappings
        const mappings = await mappingRepo.find({ where: { profesorId, academicYear } });
        console.log(`\n📋 Total mappings for profesor ${profesorId} (${academicYear}): ${mappings.length}`);

        await AppDataSource.destroy();
        console.log("\n✅ Assignment complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

assignAllSubjects();
