import { Entity, Column, ManyToOne } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { QuizResult } from "./QuizResult";
import { QuestionBank } from "./QuestionBank";

@Entity()
export class CodingAnswers extends BaseEntity {
    @ManyToOne(() => QuizResult, (quizResult) => quizResult.codingAnswers)
    quizResult!: QuizResult

    @ManyToOne(() => QuestionBank)
    question!: QuestionBank

    @Column('text')
    code!: string

    @Column()
    language!: string

    @Column({ default: false })
    isCorrect!: boolean
}
