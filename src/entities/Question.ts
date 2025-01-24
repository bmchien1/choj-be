import { Entity, Column, ManyToOne, JoinColumn, ManyToMany } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Assignment } from "./Assignment";
import { Test } from "./Test";

@Entity()
export class Question extends BaseEntity {
    @Column()
    questionName!: string;

    @Column()
    questionType!: string;

    @Column()
    grade!: string;

    @Column()
    subject!: string;

    @Column()
    difficulty_level!: string;

    @Column({ nullable: true })
    question_image_url?: string;

    @ManyToMany(() => Test, (test) => test.questions)
    tests!: Test[];
    
}
