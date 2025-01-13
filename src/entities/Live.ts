import { Entity, Column } from "typeorm";
import { BaseEntity } from "./Base/BaseEntity";

@Entity()
export class Live extends BaseEntity {
    @Column()
    title!: string;

    @Column()
    platform!: string;

    @Column()
    video_url!: string;

    @Column({ nullable: true })
    thumbnail_url?: string;

    @Column({ type: 'text', nullable: true })
    description?: string;
}
