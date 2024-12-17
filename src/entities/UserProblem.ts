import {Column, Entity, ManyToOne} from "typeorm";
import {BaseEntity} from "./Base/BaseEntity";
import Problem from "./Problem";

type RelationWrapper<T> = T;

@Entity()
class UserProblem extends BaseEntity {
	@Column()
	userId!: number
	
	@Column()
	problemId!: number
	@ManyToOne(() => Problem)
	problem!: RelationWrapper<Problem>
	
	@Column()
	contestId!: number
	
	@Column({
		default: false
	})
	accepted!: boolean
	
	@Column({
		default: 0,
		type: 'decimal',
		transformer: {
			from: value => parseFloat(value),
			to: value => value,
		}
	})
	maxSubmittedPoint!: number
	
	@Column({
		default: false
	})
	submitted!: boolean
	
	@Column({
		default: 0
	})
	submittedCount!: number
}

export default UserProblem