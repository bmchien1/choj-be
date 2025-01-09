import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { QuizResult } from "./QuizResult";
import { QuestionBank } from "./QuestionBank";

@Entity()
export class Answers extends BaseEntity {
    @ManyToOne(() => QuizResult, (quizResult) => quizResult.answers)
    quizResult!: QuizResult

    @ManyToOne(() => QuestionBank)
    question!: QuestionBank

    @Column('text')
    answerText!: string

    @Column({ default: false })
    isCorrect!: boolean
}
