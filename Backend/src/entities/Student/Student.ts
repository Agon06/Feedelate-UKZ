import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Idete } from "./Idete";
import { DorezimiIdes } from "./dorezimiIdes";
import { dorzimiProjektit } from "./dorzimiProjektit";

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


  @Column({ nullable: true, unique: true })
  nrIdCard: string;

  @Column({ nullable: true })
  academicYear: string;

  // SSO fields
  @Column({ nullable: true })
  ssoProvider: string; // 'google', 'microsoft', etc.

  @Column({ nullable: true })
  ssoProviderId: string; // Unique ID from SSO provider

  @Column({ nullable: true, type: 'text' })
  profilePicture: string;

  // Roles: can have multiple roles (e.g., "student", "student,admin")
  @Column({ default: 'student', type: 'text' })
  roles: string; // JSON stringified array of roles: ["student"] or ["student", "admin"]

  @OneToMany(() => Idete, (idete) => idete.student, { cascade: false })
  idete: Idete[];

  @OneToMany(() => DorezimiIdes, (dorezim) => dorezim.student, { cascade: false })
  dorezime: DorezimiIdes[];

  @OneToMany(() => dorzimiProjektit, (dorezim) => dorezim.student, { cascade: false })
  dorezimeProjektit: dorzimiProjektit[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

