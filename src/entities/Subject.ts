import { Entity, Column } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";

@Entity()
export class Subject extends BaseEntity {
    @Column()
    name!: string;
}
