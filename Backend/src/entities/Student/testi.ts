import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";


//ketu tek entity brenda thojzave shkruajm emrin e tabeles qe deshirojme ta klrijojm ne db
@Entity("testi")
export class testi {
    @PrimaryGeneratedColumn()
    id: number;
    //mundeni me perdor kete ndihm te chatit ketu me i shkru sha po don

    @Column({ unique: true })
    surname: string;
    //kolona mbiemri
    @Column()
    lastname: string;
    //kolona emri not null  
    @Column()
    name: string;
    //pra e kemi kriju tabelen me kolonat te cilat si ti bejme svae na ruhen ne db
   
}