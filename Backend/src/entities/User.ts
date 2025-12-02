import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ unique: true })
    username: string;

    //qetu me i kriju tana na lidhen direkt me sql php my admin, n baze te prjk ton psh id emri mbriemri....

}
