import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Idete } from "./Idete";
import { DorezimiIdes } from "./dorezimiIdes";
import { dorzimiProjektit } from "./dorzimiProjektit";


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

    // Template/Shabllon files per projektet
    @Column({ nullable: true })
    templateFile?: string;

    @Column({ nullable: true })
    templateFileName?: string;

    @OneToMany(() => Idete, (idete) => idete.lenda)
    idete: Idete[];

    @OneToMany(() => DorezimiIdes, (dorezim) => dorezim.lenda)
    dorezime: DorezimiIdes[];

    @OneToMany(() => dorzimiProjektit, (dorezim) => dorezim.lenda)
    dorezimeProjektit: dorzimiProjektit[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}