import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm";
import { Profesor } from "./Profesor";
import { Lendetp } from "./Lendetp";

@Entity("idetep")
//beje te jete unike ideja brenda nje viti
@Unique(["viti", "shkurtesa"])
export class Idetep {
    @PrimaryGeneratedColumn()
    id: number;

    // nje profesor munet me pas shum idete
    @ManyToOne(() => Profesor, (profesor) => profesor.idetep, { onDelete: "CASCADE" })
    @JoinColumn({ name: "profesorId" })
    profesor: Profesor;

    // lidhet edhe me lendet
    @ManyToOne(() => Lendetp, (lenda) => lenda.idetep, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendetp;

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
