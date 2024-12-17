import {Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany} from "typeorm";
import {BaseEntity} from "./Base/BaseEntity";
import {ProblemDifficulty} from "../types";
import ProblemTag from "./ProblemTag";
import UserProblem from "./UserProblem";
import Submission from "./Submission";
import {Contest, ProblemTestCase} from "./index";

type RelationWrapper<T> = T;

@Entity()
class Problem extends BaseEntity {
	@Column()
	problemName!: string
	
	@Column()
	problemCode!: string
	
	@Column({
		type: 'enum',
		enum: ProblemDifficulty,
		default: ProblemDifficulty.EASY
	})
	difficulty!: ProblemDifficulty
	
	@Column({
		nullable: true,
	})
	cpuTimeLimit!: number
	
	@Column({
		nullable: true,
	})
	memoryLimit!: number
	
	@Column({
		type: 'decimal',
		default: '0',
		transformer: {
			from: value => parseFloat(value),
			to: value => value,
		}
	})
	maxPoint!: number
	
	@Column()
	contestId!: number
	@ManyToOne(() => Contest)
	contest!: RelationWrapper<Contest>
	
	@Column({
		nullable: true,
	})
	maxTimeCommit?: number | null
	
	@Column({
		type: 'text',
		default: '',
	})
	problemStatement!: string

	@Column({
		type: 'text',
		default: '',
	})
	tags!: string // comma separated tags
	
	@OneToMany(() => ProblemTestCase, problemTestCase => problemTestCase.problem)
	testCases!: RelationWrapper<ProblemTestCase[]>

	public toApiResponse() {
		return {
			...this,
			tags: this.tags ? this.tags.split(',') : [],
		}
	}
}

export default Problem