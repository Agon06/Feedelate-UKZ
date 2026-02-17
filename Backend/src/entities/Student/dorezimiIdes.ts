import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Student } from "./Student";
import { Lendet } from "./Lendet";
import { Profesor } from "../Profesor/Profesor";

@Entity('dorezimiides')
export class DorezimiIdes {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, (student) => student.dorezime, { onDelete: "CASCADE" })
    @JoinColumn({ name: "studentId" })
    student: Student;

    @Column({nullable: true})
    studentId?: number;

    @ManyToOne(() => Lendet, (lenda) => lenda.dorezime, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendet;

    @Column()
    lendaId: number;

    // Profesori qe pranon dorezimin - opsional per templates
    @ManyToOne(() => Profesor, (profesor) => profesor.dorezimeIdeesh, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "profesorId" })
    profesor?: Profesor;

    @Column({ nullable: true })
    profesorId?: number;

    @Column()
    fileDorezimi: string;

    @Column()
    fileName: string;

    @Column()
    isShabllon: boolean;

    // Feedback nga profesori
    @Column({ type: "text", nullable: true })
    feedbackText?: string;

    @Column({ type: "datetime", nullable: true })
    feedbackDate?: Date;

    @Column({ type: "varchar", length: 50, nullable: true })
    vleresimi?: string; // p.sh. "Shumë mirë", "Mirë", "Mesatarisht", etj.

    @CreateDateColumn()
    createdAt: Date;
}
