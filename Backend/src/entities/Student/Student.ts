import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Idete } from "./Idete";
import { DorezimiIdes } from "./dorezimiides";

@Entity("studentet")
export class Student {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  emri: string;

  @Column()
  mbiemri: string;

  // email duhet te jete vetem %.st@uni-gjilan.net
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, unique: true })
  nrIdCard: string;

  @OneToMany(() => Idete, (idete) => idete.student, { cascade: false })
  idete: Idete[];

  @OneToMany(() => DorezimiIdes, (dorezim) => dorezim.student, { cascade: false })
  dorezime: DorezimiIdes[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
