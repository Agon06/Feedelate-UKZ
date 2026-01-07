import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Profesor } from "./Profesor";
import { Lendetp } from "./Lendetp";

@Entity('dorezimiidesp')
export class DorezimiIdesp { //krijojm nje entitet qe perfshin lenden tek dorezimi i ides 
    @PrimaryGeneratedColumn()
    id: number;   

    // nje profesor munet me pas nje dorezim te ides brenda nje lende por mund te mos kete id prof

    @ManyToOne(() => Profesor, (profesor) => profesor.dorezime, { onDelete: "CASCADE" })
    @JoinColumn({ name: "profesorId" })
    profesor: Profesor;
    // lidhet edhe me lendet
    @ManyToOne(() => Lendetp, (lenda) => lenda.dorezime, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendetp;

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
  
