import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from "typeorm";
import { Idete } from "./Idete";
import { DorezimiIdes } from "./dorezimiIdes";
import { dorzimiProjektit } from "./dorzimiProjektit";
import { Profesor } from "../Profesor/Profesor";
import { stdZgjedhore } from "./stdZgjedhore";

@Entity("lendet")
export class Lendet {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    emriLendes: string;

    @Column({ type: "int" })
    semestri: number;

    @Column({ type: "int" })
    viti: number;

    @Column({ type: "boolean", default: false })
    isZgjedhore: boolean;

    // Maksimumi i pikëve për projektin, i vendosur nga profesori
    @Column({ type: "int", default: 100 })
    projectMaxPoints: number;

    // Afati i projektit (fillimi dhe mbyllja), opsionale
    @Column({ type: "datetime", nullable: true })
    projectStartDate?: Date;

    @Column({ type: "datetime", nullable: true })
    projectDeadline?: Date;

    // Afati i dorëzimit të ideve (fillimi dhe mbyllja), opsionale
    @Column({ type: "datetime", nullable: true })
    ideaStartDate?: Date;

    @Column({ type: "datetime", nullable: true })
    ideaDeadline?: Date;

    // Titulli i afatit të dorëzimit të idesë (opsional)
    @Column({ type: "varchar", length: 255, nullable: true })
    ideaTitle?: string;

    // Lista e afateve të ideve (ruhet si JSON)
    @Column({ type: "json", nullable: true })
    ideaDeadlinesJson?: any;

    // Template/Shabllon files per projektet
    @Column({ nullable: true })
    templateFile?: string;

    @Column({ nullable: true })
    templateFileName?: string;

    // Instruksionet për projektin (ruhen si tekst i vetëm)
    @Column({ type: "text", nullable: true })
    projectInstructions?: string;

    // Relacioni me Profesorin - nje profesor mund te ketë shumë lëndë
    @ManyToOne(() => Profesor, (profesor) => profesor.lendet, { onDelete: "SET NULL", nullable: true })
    @JoinColumn({ name: "profesorId" })
    profesor?: Profesor;

    @Column({ nullable: true })
    profesorId?: number;

    @OneToMany(() => Idete, (idete) => idete.lenda)
    idete: Idete[];

    @OneToMany(() => DorezimiIdes, (dorezim) => dorezim.lenda)
    dorezime: DorezimiIdes[];

    @OneToMany(() => dorzimiProjektit, (dorezim) => dorezim.lenda)
    dorezimeProjektit: dorzimiProjektit[];

    @OneToMany(() => stdZgjedhore, (zgjedhore) => zgjedhore.lenda)
    studentZgjedhore: stdZgjedhore[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}