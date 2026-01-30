import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from "typeorm";
import { Lendet } from "./Lendet";

@Entity("instruction_templates")
export class InstructionTemplate {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column()
    lendaId!: number;

    @ManyToOne(() => Lendet, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda!: Lendet;

    @Column({ type: "varchar", length: 255 })
    title!: string;

    @Column({ type: "text", nullable: true })
    content!: string;

    @Column({ type: "simple-json", nullable: true })
    files?: Array<{ name: string; size: number; type: string; path: string }>;

    @CreateDateColumn()
    createdAt!: Date;
}
