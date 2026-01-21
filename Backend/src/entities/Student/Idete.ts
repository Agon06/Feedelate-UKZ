import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm";
import { Student } from "./Student";
import { Lendet } from "./Lendet";
import { Profesor } from "../Profesor/Profesor";

@Entity("idete")
@Unique(["viti", "shkurtesa"])
export class Idete {
    @PrimaryGeneratedColumn()
    id: number;

    // nje student munet me pas shum idete
    @ManyToOne(() => Student, (student) => student.idete, { onDelete: "CASCADE" })
    @JoinColumn({ name: "studentId" })
    student: Student;

    @Column()
    studentId: number;

    // lidhet edhe me lendet
    @ManyToOne(() => Lendet, (lenda) => lenda.idete, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendet;

    @Column()
    lendaId: number;

    // Relacioni me Profesorin - per te pare cili profesor shikon kete ide
    @ManyToOne(() => Profesor, (profesor) => profesor.idete, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "profesorId" })
    profesor?: Profesor;

    @Column({ nullable: true })
    profesorId?: number;

    @Column()
    titulli: string;

    @Column()
    shkurtesa: string;

    @Column()
    viti: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}