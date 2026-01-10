import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Idetep } from "./Idetep";
import { DorezimiIdesp } from "./dorezimiIdesp";


@Entity("lendetp")
export class Lendetp {
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

    @OneToMany(() => Idetep, (idetep) => idetep.lenda)
    idetep: Idetep[];

    @OneToMany(() => DorezimiIdesp, (dorezim) => dorezim.lenda)
    dorezime: DorezimiIdesp[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
