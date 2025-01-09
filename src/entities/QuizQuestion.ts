import { Entity, ManyToOne } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Quiz } from "./Quiz";
import { QuestionBank } from "./QuestionBank";

@Entity()
export class QuizQuestion extends BaseEntity {
    @ManyToOne(() => Quiz, (quiz) => quiz.questions)
    quiz!: Quiz

    @ManyToOne(() => QuestionBank, (question) => question.quizQuestions)
    question!: QuestionBank
}
