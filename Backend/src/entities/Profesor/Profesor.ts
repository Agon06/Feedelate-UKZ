import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";
import { Idete } from "../Student/Idete";
import { DorezimiIdes } from "../Student/dorezimiIdes";
import { Lendet } from "../Student/Lendet";

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

  @Column({ nullable: true, type: 'text' })
  profilePicture: string;

  @Column({ nullable: true })
  ssoProvider: string;

  @Column({ nullable: true })
  ssoProviderId: string;

  // Roles: can have multiple roles (e.g., "profesor", "profesor,admin")
  @Column({ default: 'profesor', type: 'text' })
  roles: string; // JSON stringified array of roles: ["profesor"] or ["profesor", "admin"]

  // Relacioni me Lendet - nje profesor mund te ketë shumë lëndë
  @OneToMany(() => Lendet, (lenda) => lenda.profesor, { cascade: false })
  lendet: Lendet[];

  // Relacioni me Idete - nje profesor mund te shikoje/vlerësojë shumë idetë
  @OneToMany(() => Idete, (idete) => idete.profesor, { cascade: false })
  idete: Idete[];

  // Relacioni me Dorezimìdesheet - profesor pranon dorezime
  @OneToMany(() => DorezimiIdes, (dorezim) => dorezim.profesor, { cascade: false })
  dorezimeIdeesh: DorezimiIdes[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
