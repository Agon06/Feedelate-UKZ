import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("profesor22")
export class Profesor22 {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    emri: string;

    @Column()
    mbiemri: string;

    @Column({ unique: true })
    email: string;



    @UpdateDateColumn()
    updatedAt: Date;
}
