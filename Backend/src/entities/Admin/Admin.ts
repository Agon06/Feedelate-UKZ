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

  @Column({ unique: true })
  username: string;

  @Column({ type: "enum", enum: ["super_admin", "admin", "moderator"], default: "admin" })
  adminLevel: string;

  @Column({ nullable: true })
  telefoni: string;

  // Roles: admin-only users have "admin" role
  @Column({ default: 'admin', type: 'text' })
  roles: string; // Always "admin" for admin-only users

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
