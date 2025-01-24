import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, JoinTable } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { User } from "./User";
import { Question } from "./Question";

@Entity()
export class Test extends BaseEntity {
    @ManyToOne(() => User)
    @JoinColumn({ name: 'user_id' })
    creator!: User;

    @Column()
    test_name!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column()
    grade!: string;

    @ManyToMany(() => Question, (question) => question.tests)
    @JoinTable({
        name: "test_questions",
        joinColumn: { name: "test_id", referencedColumnName: "id" },
        inverseJoinColumn: { name: "question_id", referencedColumnName: "id" }
    })
    questions!: Question[];

    // @Column({ type: 'time' })
    // duration?: string;

    @Column({ type: 'json' })
    questions_scores?: any;
}
