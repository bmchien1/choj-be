import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { User } from "./User";

@Entity()
export class Teacher extends BaseEntity {
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column({ nullable: true })
    position?: string;

    @Column({ nullable: true })
    work_place?: string;

    @Column({ default: 0 })
    ctv!: number;
}
