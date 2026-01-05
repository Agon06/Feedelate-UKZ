import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Student } from "./Student";
import { Lendet } from "./Lendet";

@Entity("projekti")
export class Projekti {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    emriProjekti: string;

    @Column()
    pershkrimiProjekti: string;

    @Column({ nullable: true })
    deaAdline: string;

    @ManyToOne(() => Student, { eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "studentId" })
    student: Student;

    @Column()
    studentId: number;

    @ManyToOne(() => Lendet, { eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendet;

    @Column()
    lendaId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}