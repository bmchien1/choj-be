import {ProblemTag} from "../entities";
import {ILike, Like, Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {toPageDTO} from "../utils";
import {Elysia} from "elysia";

class ProblemTagService {
	private readonly problemTagRepository: Repository<ProblemTag>;
	private static instance: ProblemTagService;
	
	constructor() {
		this.problemTagRepository = AppDataSource.getRepository(ProblemTag);
	}
	
	public static getInstance() {
		if (!ProblemTagService.instance) {
			ProblemTagService.instance = new ProblemTagService();
		}
		return ProblemTagService.instance;
	}
	
	async getAll(query: any = {}) {
		const {page = 0, limit = 10} = query;
		const options = {
			take: +limit,
			skip: +page * +limit,
			order: {createdAt: 'DESC'},
			where: {}
		};
		
		if(query.name) {
			options.where = {
				...options.where,
				name: ILike(`%${query.name}%`)
			}
		}
		
		const result = await this.problemTagRepository.findAndCount(options);
		return toPageDTO(result, +page, +limit);
	}
	
	async getOne(query: any = {}) {
		const result = await this.problemTagRepository.findOneBy(query);
		if(!result) {
			throw new Error('Problem tag not found');
		}
		
		return result;
	}
	
	async create(body: {
		tagName: string,
	}) {
		const tagNameLowerCase = body.tagName.toLowerCase();
		const problemTagExist = await this.problemTagRepository.findOneBy({tagName: tagNameLowerCase});
		
		if(problemTagExist) {
			throw new Error('Problem tag already exists');
		}
		
		const problemTag = new ProblemTag();
		problemTag.tagName = tagNameLowerCase;
		
		return await this.problemTagRepository.save(problemTag);
	}
	
	async update(id: number, body: {
		tagName?: string,
	}) {
		const problemTag = await this.problemTagRepository.findOneBy({id});
		if(!problemTag) {
			throw new Error('Problem tag not found');
		}
		
		if(body.tagName) {
			const tagNameLowerCase = body.tagName.toLowerCase();
			const problemTagExist = await this.problemTagRepository.findOneBy({tagName: tagNameLowerCase});
			if(problemTagExist) {
				throw new Error('Problem tag already exists');
			}
			problemTag.tagName = tagNameLowerCase;
		}
		
		return await this.problemTagRepository.save(problemTag);
	}
	
	async delete(id: number) {
		const problemTag = await this.problemTagRepository.findOneBy({id});
		if(!problemTag) {
			throw new Error('Problem tag not found');
		}
		
		await this.problemTagRepository.delete({id});
		
		return {
			ok: true,
			problemTag
		}
	}
	
	async softDelete(id: number) {
		const problemTag = await this.problemTagRepository.findOneBy({id});
		if(!problemTag) {
			throw new Error('Problem tag not found');
		}
		
		await this.problemTagRepository.softDelete({id});
		
		return {
			ok: true,
			problemTag
		}
	}
	
	async restore(id: number) {
		const problemTag = await this.problemTagRepository.findOneBy({id});
		if(!problemTag) {
			throw new Error('Problem tag not found');
		}
		
		await this.problemTagRepository.restore({id});
		
		return {
			ok: true,
			problemTag
		}
	}
}

export {ProblemTagService};

export default new Elysia().decorate('problemTagService', ProblemTagService.getInstance());