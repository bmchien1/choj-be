import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Question } from "./Question";

@Entity()
export class ShortAnswerQuestion extends BaseEntity {
    @ManyToOne(() => Question)
    @JoinColumn({ name: 'question_id' })
    question_id!: Question;

    @Column()
    correct_answer!: string;
}
