import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Course } from "./Course";

@Entity()
export class Assignment extends BaseEntity {
    @ManyToOne(() => Course)
    @JoinColumn({ name: 'courses_id' })
    course!: Course;

    @Column()
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column({ type: 'time' })
    duration!: string;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    start_time!: Date;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP + INTERVAL '12 WEEK'" })
    end_time!: Date;

    @Column({ type: 'json', nullable: true })
    questions_scores?: any;
}
