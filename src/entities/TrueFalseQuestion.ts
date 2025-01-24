import { Entity, Column, ManyToOne, JoinColumn, OneToOne } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Question } from "./Question";

@Entity()
export class TrueFalseQuestion extends BaseEntity {
    @OneToOne(() => Question)
    @JoinColumn({ name: 'question_id' })
    question_id!: Question;

    @Column({ type: 'json', nullable: true })
    choice!: any;

    @Column({ type: 'json', nullable: true })
    correct_answer!: any;
}
