import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("admin2")
export class Admin2 {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    emri: string;

}
