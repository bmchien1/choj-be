import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Test } from "./Test";
import { User } from "./User";

@Entity()
export class Appeal extends BaseEntity {
    @ManyToOne(() => Test)
    @JoinColumn({ name: 'test_id' })
    test!: Test;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'student_id' })
    student!: User;

    @Column({ type: 'text' })
    comment!: string;
}
