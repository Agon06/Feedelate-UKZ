import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Student } from "./Student";
import { Lendet } from "./Lendet";

@Entity('dorezimiides')
export class DorezimiIdes { //krijojm nje entitet qe perfshin lenden tek dorezimi i ides 
    @PrimaryGeneratedColumn()
    id: number;   

    // nje student munet me pas nje dorezim te ides brenda nje lende por mund te mos kete id std

    @ManyToOne(() => Student, (student) => student.dorezime, { onDelete: "CASCADE" })
    @JoinColumn({ name: "studentId" })
    student: Student;
    // lidhet edhe me lendet
    @ManyToOne(() => Lendet, (lenda) => lenda.dorezime, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendet;

    // kolona per vendosjen e path te file te dorezimit te ides
    @Column()
    fileDorezimi: string;

    // kolona per emrin e file te dorezimit te ides
    @Column()
    fileName: string;

    @Column()
    isShabllon: boolean;

    @CreateDateColumn()
    createdAt: Date;
    
}
  