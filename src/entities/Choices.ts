import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { QuestionBank } from "./QuestionBank";

@Entity()
export class Choices extends BaseEntity {
    @ManyToOne(() => QuestionBank)
    question!: QuestionBank

    @Column('text')
    choiceText!: string

    @Column({ default: false })
    isCorrect!: boolean
}
