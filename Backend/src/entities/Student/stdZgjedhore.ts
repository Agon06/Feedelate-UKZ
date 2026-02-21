import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Student } from "./Student";
import { Lendet } from "./Lendet";

@Entity("stdZgjedhore")
export class stdZgjedhore {
    @PrimaryGeneratedColumn()
    id: number;

    // Relacioni me studentin (many-to-one)
    @ManyToOne(() => Student, (student) => student.zgjedhoreList, { onDelete: "CASCADE" })
    @JoinColumn({ name: "studentId" })
    student: Student;

    @Column()
    studentId: number;

    // Relacioni me lënden (many-to-one)
    @ManyToOne(() => Lendet, (lenda) => lenda.studentZgjedhore, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendet;

    @Column()
    lendaId: number;

    @CreateDateColumn()
    createdAt: Date;
}
   