import {Column, Entity, ManyToOne} from "typeorm";
import User from "./User";
import {Contest} from "./index";
import {BaseEntity} from "./Base/BaseEntity";

type RelationWrapper<T> = T;
@Entity()
class JoinContestRequest extends BaseEntity {
    @Column()
    userId!: number
    @ManyToOne(() => User)
    user!: RelationWrapper<User>

    @Column()
    contestId!: number
    @ManyToOne(() => Contest)
    contest!: RelationWrapper<Contest>

    @Column({
        default: 0,
    })
    status!: number
    // 0: pending, 1: accepted, 2: rejected
}

export default JoinContestRequest