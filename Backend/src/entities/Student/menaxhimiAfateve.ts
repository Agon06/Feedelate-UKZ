import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from "typeorm";
import { Lendet } from "./Lendet";

@Entity('menaxhimiAfateve')
export class MenaxhimiAfateve { //entiteti per menaxhimin e afateve te dorezimit te idese dhe projektit
    @PrimaryGeneratedColumn()
    id: number;
    
    // lidhet me lendet (afatet vendosen per lende, jo per student individual)
    @ManyToOne(() => Lendet, { onDelete: "CASCADE" })
    @JoinColumn({ name: "lendaId" })
    lenda: Lendet;
    
    // lloji i afatit: 'ide' ose 'projekt'
    @Column({ type: 'enum', enum: ['ide', 'projekt'] })
    tipi: 'ide' | 'projekt';
    
    // data e fillimit te afatit
    @Column({ type: 'date' })
    dataFillimit: string;
    
    // data e mbarimit te afatit
    @Column({ type: 'date' })
    dataMbarimit: string;
    
    // tema/detyra (opsionale)
    @Column({ type: 'text', nullable: true })
    tema: string;
    
    // formati i deshiruar (opsionale)
    @Column({ type: 'varchar', length: 100, nullable: true })
    formati: string;
    
    // komente nga profesori (opsionale)
    @Column({ type: 'text', nullable: true })
    komente: string;
    
    @CreateDateColumn()
    createdAt: Date;

}