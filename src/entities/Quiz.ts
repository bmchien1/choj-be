import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Lesson } from "./Lesson";
import { QuizQuestion } from "./QuizQuestion";

@Entity()
export class Quiz extends BaseEntity {
    @Column()
    title!: string

    @Column('text')
    description!: string

    @ManyToOne(() => Lesson, (lesson) => lesson.quizzes)
    lesson!: Lesson

    @OneToMany(() => QuizQuestion, (quizQuestion) => quizQuestion.quiz)
    questions!: QuizQuestion[]
}
