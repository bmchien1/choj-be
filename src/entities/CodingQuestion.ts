import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Question } from "./Question";

@Entity()
export class CodingQuestion extends BaseEntity {
    @ManyToOne(() => Question)
    @JoinColumn({ name: 'question_id' })
    question!: Question;

    @Column({ type: 'text' })
    template_code!: string;

    @Column({ type: 'json' })
    test_cases!: any;
}
