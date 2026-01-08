import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm";
import { Student } from "./Student";
import { Lendet } from "./Lendet";

@Entity("idete")
//beje te jete unike ideja brenda nje viti
@Unique(["viti", "shkurtesa"])
export class Idete {
    @PrimaryGeneratedColumn()
    id: number;

    // nje student munet me pas shum idete
    @ManyToOne(() => Student, (student) => student.idete, { onDelete: "CASCADE" })
    @JoinColumn({ name: "studentId" })
    student: Student;

    // lidhet edhe me lendet
    @ManyToOne(() => Lendet, (lenda) => lenda.idete, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendet;
//TO DO:UNIQUE PER KETE VIT
//titulli te jet unik brenda nje viti
    @Column()
    titulli: string;
//TO DO:UNIQUE PER KETE VIT
    @Column()
    shkurtesa: string;
    //psh:2024
    @Column()
    viti:number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    //krijon tabelen me kolona ne db 
}