import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Profesor } from "./Profesor";
import { Lendetp } from "./Lendetp";

@Entity("projektip")
export class Projektip {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    emriProjekti: string;

    @Column()
    pershkrimiProjekti: string;

    @Column({ nullable: true })
    deaAdline: string;

    @ManyToOne(() => Profesor, { eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "profesorId" })
    profesor: Profesor;

    @Column()
    profesorId: number;

    @ManyToOne(() => Lendetp, { eager: true, onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendetp;

    @Column()
    lendaId: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
