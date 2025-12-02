import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("studentet")
export class Student {
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
  nrPersonal: string;

  @Column({ nullable: true })
  drejtimi: string;

  @Column({ type: "int", nullable: true })
  viti: number;

  @Column({ nullable: true })
  telefoni: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
