import {Column, Entity, ManyToOne, OneToMany} from "typeorm";
import {SubmissionStatus} from "../types";
import Problem from "./Problem";
import {BaseEntity} from "./Base/BaseEntity";
import {Contest, SubmissionTestCase} from "./index";
import User from "./User";

type RelationWrapper<T> = T;

@Entity()
class Submission extends BaseEntity {
	@Column()
	userId!: number
	@ManyToOne(() => User)
	user!: RelationWrapper<User>
	
	@Column()
	problemId!: number
	@ManyToOne(() => Problem)
	problem!: RelationWrapper<Problem>
	
	@Column()
	contestId!: number
	@ManyToOne(() => Contest)
	contest!: RelationWrapper<Contest>
	
	@Column({
		type: 'enum',
		enum: SubmissionStatus,
		default: SubmissionStatus.PENDING
	})
	status!: SubmissionStatus
	
	@Column({
		default: 0,
		type: 'decimal',
		transformer: {
			from: value => parseFloat(value),
			to: value => value,
		}
	})
	point!: number
	
	@Column()
	submissionDate!: Date
	
	@Column({
		type: 'text',
		default: '',
		nullable: true
	})
	message!: string
	
	@Column({
		type: 'text',
		default: '',
		nullable: true
	})
	error!: string
	
	@Column({
		type: 'text',
		unique: true
	})
	submissionHash!: string
	
	@Column()
	languageId!: number
	
	@Column({
		type: 'text',
		default: ''
	})
	listSubmissionToken!: string // This is a list of submission token, separated by comma
	
	@Column({
		default: 0,
		type: 'integer'
	})
	testCasePassed!: number
	
	@Column({
		type: 'text',
		default: ''
	})
	sourceCode!: string
	
	@OneToMany(() => SubmissionTestCase, submissionTestCase => submissionTestCase.submission)
	testCases!: RelationWrapper<SubmissionTestCase[]>
}

export default Submission