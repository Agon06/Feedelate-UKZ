import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
