import {Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {Submission} from "./index";

type RelationWrapper<T> = T;
@Entity()
class SubmissionTestCase {
	@PrimaryColumn()
	id!: string;
	
	@Column()
	submissionId!: number;
	@ManyToOne(() => Submission, submission => submission.id)
	submission!: RelationWrapper<Submission>
	
	@Column()
	input!: string;
	
	@Column()
	expectedOutput!: string;
	
	@Column({
		nullable: true
	})
	userOutput!: string;

	@Column({
		default: 0
	})
	hidden!: number;
	// 0: false, 1: true
	
	@Column({
		type: 'text',
		default: 'Pending',
		nullable: true
	})
	message!: string;
	
	@Column({
		type: 'decimal',
		default: '0',
		transformer: {
			from: value => parseFloat(value),
			to: value => value,
		}
	})
	point!: number;
	
	@Column({
		default: false
	})
	isSuccess!: boolean;

	@CreateDateColumn()
	createdAt!: Date;

	@UpdateDateColumn()
	updatedAt!: Date;

	@DeleteDateColumn()
	deleteAt!: Date;

	public toApiResponse(isHide: boolean) {
		if (isHide && this.hidden === 1) {
			return {
				...this,
				input: 'Hidden',
				expectedOutput: 'Hidden',
			}
		}
		return this
	}

}

export default SubmissionTestCase;