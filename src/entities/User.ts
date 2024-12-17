import {
    Column,
    Entity,
} from "typeorm";
import {AppRole} from "../types";
import {BaseEntity} from "./Base/BaseEntity";

@Entity()
class User extends BaseEntity {
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
    
    @Column({
        nullable: true
    })
    resetPasswordToken?: string | null

    @Column({
        default: false
    })
    isVerified!: boolean

    @Column({
        nullable: true
    })
    verificationToken?: string | null
    
    @Column({
        default: 0,
    })
    totalScore!: number
    
    @Column({
        default: 0,
    })
    totalSolved!: number
    
    public toApiResponse() {
        const {password, resetPasswordToken, verificationToken, ...rest} = this
        return rest
    }
}

export default User
