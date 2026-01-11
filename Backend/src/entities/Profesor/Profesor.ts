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

  @Column({ nullable: true })
  departamenti: string;

  @Column({ nullable: true })
  grada: string;

  @Column({ nullable: true })
  telefoni: string;

  @Column({ nullable: true, type: 'text' })
  profilePicture: string;

  @Column({ nullable: true })
  ssoProvider: string;

  @Column({ nullable: true })
  ssoProviderId: string;

  // Roles: can have multiple roles (e.g., "profesor", "profesor,admin")
  @Column({ default: 'profesor', type: 'text' })
  roles: string; // JSON stringified array of roles: ["profesor"] or ["profesor", "admin"]

  @OneToMany(() => Idetep, (idetep) => idetep.profesor, { cascade: false })
  idetep: Idetep[];

  @OneToMany(() => DorezimiIdesp, (dorezim) => dorezim.profesor, { cascade: false })
  dorezime: DorezimiIdesp[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
