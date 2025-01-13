import { Entity, Column } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";

@Entity()
export class Grade extends BaseEntity {
    @Column()
    name!: string;
}