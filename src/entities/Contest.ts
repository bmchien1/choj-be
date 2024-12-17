import {Column, Entity, OneToMany} from "typeorm";
import {BaseEntity} from "./Base/BaseEntity";
import {ContestStatus} from "../types";
import Problem from "./Problem";
import UserContest from "./UserContest";

type RelationWrapper<T> = T;

@Entity()
class Contest extends BaseEntity {
	@Column()
	contestName!: string
	
	@Column()
	creator!: string
	
	@Column({
		type: 'text',
		default: '',
		nullable: true
	})
	description!: string
	
	@Column({
		type: 'enum',
		enum: ContestStatus,
		default: ContestStatus.RUNNING
	})
	status!: ContestStatus

	@Column({
		default: false
	})
	isPublic!: boolean
	
	@OneToMany(() => UserContest, userContest => userContest.contest)
	userContests!: RelationWrapper<UserContest[]>
}

export default Contest