import { Entity, Column } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";

@Entity()
export class ExerciseType extends BaseEntity {
    @Column()
    name!: string;
}
