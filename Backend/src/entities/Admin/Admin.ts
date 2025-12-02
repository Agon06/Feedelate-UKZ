import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("admins")
export class Admin {
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

  @Column({ unique: true })
  username: string;

  @Column({ type: "enum", enum: ["super_admin", "admin", "moderator"], default: "admin" })
  role: string;

  @Column({ nullable: true })
  telefoni: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
