import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Course } from "./Course";
import { User } from "./User";

@Entity()
export class Student extends BaseEntity {
    @ManyToOne(() => Course)
    @JoinColumn({ name: 'courses_id' })
    course!: Course;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ type: 'enum', enum: ['pending', 'approved', 'audited'], default: 'pending' })
    status!: 'pending' | 'approved' | 'audited';
}
