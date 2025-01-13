import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Question } from "./Question";

@Entity()
export class QuestionsBank extends BaseEntity {
    @Column()
    grade!: string;

    @Column()
    subject!: string;

    @Column()
    exercise_type!: string;

    @Column()
    difficulty_level!: string;

    @ManyToOne(() => Question)
    @JoinColumn({ name: 'question_id' })
    question!: Question;
}
