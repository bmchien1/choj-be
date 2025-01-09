import {
    Column,
    Entity,
    OneToMany,
} from "typeorm";
import {AppRole} from "../types";
import {BaseEntity} from "./Base/BaseEntity";
import { Course } from "./Course";

@Entity()
export class User extends BaseEntity {
    @Column()
    name!: string

    @Column()
    email!: string

    @Column()
    password!: string

    @Column({
        type: 'enum',
        enum: AppRole,
        default: AppRole.USER
    })
    role!: AppRole

    @OneToMany(() => Course, (course) => course.createdBy)
    createdCourses!: Course[]
}