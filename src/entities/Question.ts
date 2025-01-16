import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";

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
}
