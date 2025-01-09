import { Entity, Column, OneToMany } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { QuizQuestion } from "./QuizQuestion";
import { Choices } from "./Choices";
@Entity()
export class QuestionBank extends BaseEntity {
    @Column('text')
    questionText!: string

    @Column({
        type: 'enum',
        enum: ['multiple_choice', 'essay', 'true_false', 'coding']
    })
    questionType!: string

    @OneToMany(() => QuizQuestion, (quizQuestion) => quizQuestion.question)
    quizQuestions!: QuizQuestion[]

    @OneToMany(() => Choices, (choice) => choice.question)
    choices!: Choices[]

}
