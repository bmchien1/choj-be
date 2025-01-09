import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { User } from "./User";
import { Quiz } from "./Quiz";
import { Answers } from "./Answers";
import { CodingAnswers } from "./CodingAnswers";

@Entity()
export class QuizResult extends BaseEntity {
    @ManyToOne(() => User)
    user!: User

    @ManyToOne(() => Quiz)
    quiz!: Quiz

    @Column()
    score!: number

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    completedAt!: Date

    @OneToMany(() => Answers, (answer) => answer.quizResult)
    answers!: Answers[]

    @OneToMany(() => CodingAnswers, (codingAnswer) => codingAnswer.quizResult)
    codingAnswers!: CodingAnswers[]
}
