import { Entity, Column, ManyToOne, JoinColumn } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { Assignment } from "./Assignment";
import { User } from "./User";
import { Question } from "./Question";
import { CodingQuestion } from "./CodingQuestion";
import { SubmissionStatus } from "../types";
type RelationWrapper<T> = T;

@Entity()
export class Submission extends BaseEntity {
    @ManyToOne(() => Assignment)
    @JoinColumn({ name: "assignment_id" })
    assignment!: Assignment;

    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    user!: User;

	@ManyToOne(() => CodingQuestion)
	question!: RelationWrapper<CodingQuestion>

    @Column({ type: "json" })
    answers!: any;  // JSON array containing answers based on questionType

    @Column({ nullable: true })
    score?: number;

    @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
    submitted_at!: Date;

    @Column({
		type: 'text',
		default: ''
	})
	listSubmissionToken!: string // This is a list of submission token, separated by comma

    
	@Column({
		type: 'text',
		default: '',
		nullable: true
	})
	error!: string

    
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
	
    @Column()
	languageId!: number

    @Column({
		type: 'enum',
		enum: SubmissionStatus,
		default: SubmissionStatus.PENDING
	})
	status!: SubmissionStatus
}
