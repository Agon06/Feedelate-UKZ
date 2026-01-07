import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Idetep } from "./Idetep";
import { DorezimiIdesp } from "./dorezimiIdesp";

@Entity("profesoret")
export class Profesor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  emri: string;

  @Column()
  mbiemri: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  departamenti: string;

  @Column({ nullable: true })
  grada: string;

  @Column({ nullable: true })
  telefoni: string;

  @OneToMany(() => Idetep, (idetep) => idetep.profesor, { cascade: false })
  idetep: Idetep[];

  @OneToMany(() => DorezimiIdesp, (dorezim) => dorezim.profesor, { cascade: false })
  dorezime: DorezimiIdesp[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
