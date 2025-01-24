import { Entity, Column, ManyToOne, JoinColumn, OneToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Question } from "./Question";
import {TestCase} from "./TestCase";
type RelationWrapper<T> = T;

@Entity()
export class CodingQuestion extends BaseEntity {
    @OneToOne(() => Question)
    @JoinColumn({ name: 'question_id' })
    question_id!: Question;

    @Column({ type: 'text' })
    template_code!: string;

    @Column({ type: 'json' })
    test_cases!: any;

    @Column({
		nullable: true,
	})
	cpuTimeLimit?: number
	
	@Column({
		nullable: true,
	})
	memoryLimit?: number

    @Column({
		type: 'decimal',
		default: '0',
		transformer: {
			from: value => parseFloat(value),
			to: value => value,
		}
	})
	maxPoint!: number

    @OneToMany(() => TestCase, testCase => testCase.question)
	testCases!: RelationWrapper<TestCase[]>
}
