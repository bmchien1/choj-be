import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { User } from "./User";
import { Test } from "./Test";

@Entity()
export class TestSubmission extends BaseEntity {
    @ManyToOne(() => User)
    @JoinColumn({ name: 'student_id' })
    student!: User;

    @ManyToOne(() => Test)
    @JoinColumn({ name: 'test_id' })
    test!: Test;

    @Column({ type: 'json' })
    answer!: any;

    @Column({ type: 'double precision' })
    points!: number;
}
