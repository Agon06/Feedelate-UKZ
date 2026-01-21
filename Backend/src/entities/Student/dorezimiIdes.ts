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

    @Column()
    studentId: number;

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

    @CreateDateColumn()
    createdAt: Date;
}
