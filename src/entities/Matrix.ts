import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { User } from "./User";

@Entity()
export class Matrix extends BaseEntity {
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    user!: User;

    @Column()
    name!: string;

    @Column({ type: 'json' })
    criteria!: any; // Example: { subject: "Math", difficulty: "easy", questionCount: 10 }

    @Column({ type: 'text', nullable: true })
    description?: string;
}

