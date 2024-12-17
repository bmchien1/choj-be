import {Column, Entity, ManyToOne} from "typeorm";
import {BaseEntity} from "./Base/BaseEntity";
import User from "./User";
import Contest from "./Contest";

type RelationWrapper<T> = T;

@Entity()
class UserContest extends BaseEntity {
	@Column()
	userId!: number
	
	@Column()
	contestId!: number
	@ManyToOne(() => Contest, contest => contest.userContests)
	contest!: RelationWrapper<Contest>
}

export default UserContest