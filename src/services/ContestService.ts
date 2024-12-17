import {Contest, User, UserContest} from "../entities";
import {FindManyOptions, ILike, Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {toPageDTO} from "../utils";
import {ContestStatus} from "../types";
import {Elysia} from "elysia";

class ContestService {
	private readonly contestRepository: Repository<Contest>;
	private static instance: ContestService;
	private readonly userRepository: Repository<User>;
	private readonly userContestRepository: Repository<UserContest>;

	constructor() {
		this.contestRepository = AppDataSource.getRepository(Contest);
		this.userRepository = AppDataSource.getRepository(User);
		this.userContestRepository = AppDataSource.getRepository(UserContest);
	}
	
	public static getInstance() {
		if (!ContestService.instance) {
			ContestService.instance = new ContestService();
		}
		return ContestService.instance;
	}
	
	async getAll(query: any = {}) {
		const {page = 0, limit = 10} = query;
		const options: FindManyOptions = {
			take: +limit,
			skip: +page * +limit,
			order: {createdAt: 'DESC'},
			where: {},
		};

		if(query.isPublic) {
			options.where = {
				...options.where,
				isPublic: query.isPublic === 'true'
			}
		}
		
		if(query.q) {
			options.where = {
				...options.where,
				contestName: ILike(`%${query.q}%`)
			}
		}
		
		if(query.userId) {
			// only get contests that user don't have user contest
			const userContests = await this.userContestRepository.find({
				where: {
					userId: query.userId
				}
			});
			
			const contestIds = userContests.map(userContest => userContest.contestId);
			const [result, total] = await this.contestRepository.findAndCount(options);
			
			const formattedResult = result.map(contest => {
				return {
					...contest,
					isJoined: contestIds.includes(contest.id)
				}
			})
			
			return toPageDTO([formattedResult, total], +page, +limit);
		}
		
		const result = await this.contestRepository.findAndCount(options);
		return toPageDTO(result, +page, +limit);
	}
	
	async getOne(query: any = {}) {
		const result = await this.contestRepository.findOneBy(query);
		if(!result) {
			throw new Error('Contest not found');
		}
		
		if(query.userId) {
			const formattedResult = {
				...result,
				isJoined: false
			}
			const userContest = await this.userContestRepository.findOneBy({
				userId: query.userId,
				contestId: result.id
			});
			formattedResult.isJoined = !!userContest;
			
			return formattedResult;
		}
		
		return result;
	}
	
	async create(body: {
		contestName: string,
		creator: string,
		description?: string,
		isPublic?: boolean
	}) {
		const contest = new Contest();
		contest.contestName = body.contestName;
		contest.creator = body.creator;
		contest.status = ContestStatus.RUNNING;
		if(body.description) {
			contest.description = body.description;
		}

		if(body.hasOwnProperty('isPublic') && typeof body.isPublic === 'boolean') {
			contest.isPublic = body.isPublic
		}
		
		const saveContest = await this.contestRepository.save(contest);

		await this.onCreateUserContest(saveContest);
		return saveContest
	}
	
	async update(id: number, body: {
		contestName?: string,
		creator?: string,
		description?: string,
		status?: string,
	}) {
		const contest = await this.contestRepository.findOneBy({id});
		
		if (!contest) {
			throw new Error('Contest not found');
		}
		
		if (body.contestName) {
			contest.contestName = body.contestName;
		}
		
		if (body.creator) {
			contest.creator = body.creator;
		}
		
		if (body.description) {
			contest.description = body.description;
		}
		
		if (body.status) {
			contest.status = body.status as ContestStatus;
		}
		
		return await this.contestRepository.save(contest);
	}
	
	async softDelete(id: number) {
		const contest = await this.contestRepository.findOneBy({id});
		
		if (!contest) {
			throw new Error('Contest not found');
		}
		
		await this.contestRepository.softDelete({id});
		
		return {
			ok: true,
			contest
		}
	}
	
	async restore(id: number) {
		const contest = await this.contestRepository.findOne({
			where: {id},
			withDeleted: true
		});
		
		if (!contest) {
			throw new Error('Contest not found');
		}
		
		await this.contestRepository.restore({id});
		
		return {
			ok: true,
			contest
		}
	}
	
	async delete(id: number) {
		const contest = await this.contestRepository.findOneBy({id});
		
		if (!contest) {
			throw new Error('Contest not found');
		}
		
		await this.contestRepository.delete({id});
		
		return {
			ok: true,
			contest
		}
	}

	async onCreateUserContest(contest: Contest) {
		// create many user contest for user if contest is public
		if (contest.isPublic) {
			const users = await this.userRepository.find();

			const userContests = users.map(user => {
				const userContest = new UserContest();
				userContest.userId = user.id;
				userContest.contestId = contest.id;
				return userContest;
			});

			await this.userContestRepository.save(userContests);
			console.log('Created user contests for all users if contest is public');
		}
	}
}

export {ContestService};

export default new Elysia().decorate('contestService', ContestService.getInstance());