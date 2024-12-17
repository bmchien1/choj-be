import {Column, Entity, ManyToOne} from "typeorm";
import {BaseEntity} from "./Base/BaseEntity";
import Problem from "./Problem";

type RelationWrapper<T> = T;

@Entity()
class ProblemTestCase extends BaseEntity {
	@Column()
	problemId!: number
	@ManyToOne(() => Problem, problem => problem.testCases)
	problem!: Problem
	
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

export default ProblemTestCase