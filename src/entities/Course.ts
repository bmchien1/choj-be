import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { User } from "./User";

@Entity()
export class Course extends BaseEntity {
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column()
    name!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column()
    class!: string;

    @Column({ nullable: true })
    image_url?: string;

    @Column({ default: 'Toán' })
    subject!: string;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP" })
    start_time!: Date;

    @Column({ type: 'timestamp', default: () => "CURRENT_TIMESTAMP + INTERVAL '12 WEEK'" })
    end_time!: Date;
}
