import { AppDataSource } from "./data-source";
import { ProfesorLendetMapping } from "./entities/Student/ProfesorLendetMapping";

async function testMapping() {
    try {
        await AppDataSource.initialize();
        console.log("✅ Database connected");

        const mappingRepo = AppDataSource.getRepository(ProfesorLendetMapping);

        // Create a mapping: profesor 1 -> lenda 1 for academic year 2025/2026
        const existing = await mappingRepo.findOne({
            where: { profesorId: 1, lendetId: 1, academicYear: "2025/2026" }
        });

        if (!existing) {
            const mapping = mappingRepo.create({
                profesorId: 1,
                lendetId: 1,
                academicYear: "2025/2026"
            });
            await mappingRepo.save(mapping);
            console.log("✅ Mapping created: profesor 1 -> lenda 1 (2025/2026)");
        } else {
            console.log("✅ Mapping already exists");
        }

        // Show all mappings
        const all = await mappingRepo.find();
        console.log(`\n📋 Total mappings: ${all.length}`);
        all.forEach(m => {
            console.log(`  - Profesor ${m.profesorId} -> Lenda ${m.lendetId} (${m.academicYear})`);
        });

        await AppDataSource.destroy();
        console.log("\n✅ Test completed");
        process.exit(0);
    } catch (error) {
        console.error("❌ Error:", error);
        process.exit(1);
    }
}

testMapping();
