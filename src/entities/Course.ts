import { Entity, Column, ManyToOne, JoinColumn, ManyToMany, OneToMany } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { User } from "./User";
import { Assignment } from "./Assignment";
type RelationWrapper<T> = T;

@Entity()
export class Course extends BaseEntity {
    @ManyToOne(() => User)
    @JoinColumn({ name: "user_id" })
    creator!: User; 

    @Column()
    name!: string;

    @Column({ type: 'text' })
    description!: string;

    @Column()
    class!: string;

    @Column({ default: 'Toán' })
    subject!: string;

    @OneToMany(() => Assignment, assignment => assignment.course)
    testCases!: RelationWrapper<Assignment[]>
    
}
