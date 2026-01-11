import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Student } from "./Student";
import { Lendet } from "./Lendet";

@Entity('dorezimiides')
export class DorezimiIdes {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, (student) => student.dorezime, { onDelete: "CASCADE" })
    @JoinColumn({ name: "studentId" })
    student: Student;

    @ManyToOne(() => Lendet, (lenda) => lenda.dorezime, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendet;

    @Column()
    fileDorezimi: string;

    @Column()
    fileName: string;

    @Column()
    isShabllon: boolean;

    @CreateDateColumn()
    createdAt: Date;
}
  