import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Student } from "./Student";
import { Lendet } from "./Lendet";

@Entity('dorzimiprojektit')
export class dorzimiProjektit { //krijojm nje entitet qe perfshin lenden tek dorezimi i projektit 
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Student, (student) => student.dorezimeProjektit, { onDelete: "CASCADE" })
    @JoinColumn({ name: "studentId" })
    student: Student;
    // lidhet edhe me lendet
    @ManyToOne(() => Lendet, (lenda) => lenda.dorezimeProjektit, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendet;
    // kolona per vendosjen e path te file te dorezimit te projektit

    //Afati dorezimit te projektit
    @Column()
    afatiDorezimit: Date;

    //Piket e projekttit
    @Column()
    piket: number;

    //statiusi i projektit i dorzuar apo i pa dorzuar
    @Column()
    statusi: string;

    @Column()
    fileDorezimi: string;
    // kolona per emrin e file te dorezimit te projektit
    @Column()
    fileName: string;

    @CreateDateColumn()
    createdAt: Date;



}