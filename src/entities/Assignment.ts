import { Entity, Column, ManyToOne, JoinColumn, OneToMany, ManyToMany, JoinTable } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Course } from "./Course";
import { Question } from "./Question";

@Entity()
export class Assignment extends BaseEntity {
    @ManyToOne(() => Course)
    @JoinColumn({ name: 'course_id' })
    course!: any;

    @Column()
    title!: string;

    @Column({ type: 'text' })
    description!: string;

    // @Column({ type: 'json', nullable: true })
    // questions?: any;

    @Column({nullable: true})
    duration?: Number;

    @Column({ type: 'json', nullable: true })
    questions?: any;

    @Column({ type: 'json', nullable: true })
    questions_scores?: any;

    @Column()
    total_points?: Number;
}
                                                                                                                                                                                             