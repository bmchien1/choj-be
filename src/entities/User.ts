import { Entity, Column, OneToOne, JoinColumn, ManyToOne, OneToMany } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";
import { AppRole } from "../types";

@Entity()
export class User extends BaseEntity {
    @Column() 
    email!: string;

    @Column() 
    password!: string;

    @Column({
        type: 'enum',
        enum: AppRole,
        default: AppRole.USER
    })
    role!: AppRole

    @Column({ nullable: true })
    avatar_url?: string;

    @Column({ nullable: true })
    access_token?: string;

    @Column({ nullable: true })
    refresh_token?: string;

    public toApiResponse() {
        const {password, ...rest} = this
        return rest
    }
}
