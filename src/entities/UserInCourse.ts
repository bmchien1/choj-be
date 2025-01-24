import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Course } from "./Course";
import { User } from "./User";

@Entity()
export class UserInCourse extends BaseEntity {
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Course)
    @JoinColumn({ name: 'course_id' })
    course!: Course;

    @Column("json", { default: [] })
    lessonProgress?: Record<string, boolean>[] ;  // Tracking lesson completion
  
    @Column("json", { default: [] })
    assignmentProgress?: Record<string, number>[];  // Tracking assignment completion
}
