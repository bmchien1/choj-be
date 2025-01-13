import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { QuestionType } from "./QuestionType";

@Entity()
export class Question extends BaseEntity {
    @ManyToOne(() => QuestionType)
    @JoinColumn({ name: 'question_type_id' })
    questionType!: QuestionType;

    @Column({ type: 'json' })
    question!: any;

    @Column({ nullable: true })
    question_image_url?: string;
}
