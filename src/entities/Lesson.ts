import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Course } from "./Course";

@Entity()
export class Lesson extends BaseEntity {
    @ManyToOne(() => Course)
    @JoinColumn({ name: 'course_id' })
    course!: Course;

    @Column()
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ nullable: true })
    file_url?: string;
}
