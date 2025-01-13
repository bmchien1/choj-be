import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { User } from "./User";
import { Assignment } from "./Assignment";

@Entity()
export class AssignmentSubmission extends BaseEntity {
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @ManyToOne(() => Assignment)
    @JoinColumn({ name: 'assignment_id' })
    assignment!: Assignment;

    @Column({ type: 'json' })
    answer!: any;

    @Column({ type: 'double precision' })
    points!: number;
}
