import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Idete } from "./Idete";
import { DorezimiIdes } from "./dorezimiides";


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

    @OneToMany(() => Idete, (idete) => idete.lenda)
    idete: Idete[];

    @OneToMany(() => DorezimiIdes, (dorezim) => dorezim.lenda)
    dorezime: DorezimiIdes[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}