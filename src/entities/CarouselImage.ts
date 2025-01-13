import { Entity, Column } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";

@Entity()
export class CarouselImage extends BaseEntity {
    @Column()
    link_url!: string;
}
