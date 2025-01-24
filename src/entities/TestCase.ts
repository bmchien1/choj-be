import {Column, Entity, ManyToOne} from "typeorm";
import {BaseEntity} from "./Base/BaseEntity";
import { CodingQuestion } from "./CodingQuestion";

type RelationWrapper<T> = T;

@Entity()
export class TestCase extends BaseEntity {
	@Column()
	problemId!: number

    @ManyToOne(() => CodingQuestion, (codingQuestion) => codingQuestion.testCases)
    question!: RelationWrapper<CodingQuestion>;
	
	@Column({
		type: 'text'
	})
	input!: string
	
	@Column({
		type: 'text'
	})
	output!: string

	@Column({
		default: 0,
	})
	hidden!: number
	// 0: false, 1: true

	public toApiResponse(isHide: boolean) {
		if (isHide && this.hidden === 1) {
			return {
				...this,
				input: 'Hidden',
				output: 'Hidden'
			}
		}
		return this
	}
}
