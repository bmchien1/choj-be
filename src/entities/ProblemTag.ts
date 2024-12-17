import {Column, Entity} from "typeorm";
import {BaseEntity} from "./Base/BaseEntity";

@Entity()
class ProblemTag extends BaseEntity {
	@Column()
	tagName!: string
}

export default ProblemTag