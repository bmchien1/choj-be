import { Entity, Column } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";

@Entity()
export class QuestionType extends BaseEntity {
    @Column()
    name!: string;
}
