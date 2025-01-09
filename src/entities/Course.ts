import { Entity, Column, OneToMany, ManyToOne } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { User } from "./User";
import { Lesson } from "./Lesson";

@Entity()
export class Course extends BaseEntity {
    @Column()
    title!: string

    @Column('text')
    description!: string

    @ManyToOne(() => User, (user) => user.createdCourses)
    createdBy!: User

    @OneToMany(() => Lesson, (lesson) => lesson.course)
    lessons!: Lesson[]
}
