import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { User } from "./User";

@Entity()
export class Test extends BaseEntity {
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column()
    test_name!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column()
    grade!: string;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'creater_id' })
    creater!: User;

    @Column({ type: 'time' })
    duration!: string;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    start_time!: Date;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP + INTERVAL '12 WEEK'" })
    end_time!: Date;

    @Column({ type: 'json' })
    questions_scores!: any;
}
