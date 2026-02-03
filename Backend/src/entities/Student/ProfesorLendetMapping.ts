import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, Unique } from "typeorm";
import { Lendet } from "./Lendet";

@Entity("profesor_lendet_mapping")
@Unique(["profesorId", "lendetId"])
export class ProfesorLendetMapping {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: "int" })
    profesorId: number;

    @Column({ type: "int" })
    lendetId: number;

    @ManyToOne(() => Lendet, (lendet) => lendet.id, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendetId" })
    lendet?: Lendet;

    @CreateDateColumn()
    assignedAt: Date;
}
