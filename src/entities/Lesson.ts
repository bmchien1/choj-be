import { Entity, Column, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Course } from "./Course";
import { Quiz } from "./Quiz";

@Entity()
export class Lesson extends BaseEntity {
    @Column()
    title!: string

    @Column('text')
    content!: string

    @ManyToOne(() => Course, (course) => course.lessons)
    course!: Course

    @OneToMany(() => Quiz, (quiz) => quiz.lesson)
    quizzes!: Quiz[]
}
