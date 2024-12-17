import {Contest, User, UserContest} from "../entities";
import {FindManyOptions, ILike, Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {UserService} from "./UserService";
import {toPageDTO} from "../utils";
import {Elysia} from "elysia";
import {UserProblemService} from "./UserProblemService";

class UserContestService {
	private readonly userContestRepository: Repository<UserContest>;
	private static instance: UserContestService;
	private readonly userRepository: Repository<User>
	private readonly userProblemService: UserProblemService;
	private readonly contestRepository: Repository<Contest>;
	
	constructor() {
		this.userContestRepository = AppDataSource.getRepository(UserContest);
		this.userRepository = AppDataSource.getRepository(User);
		this.userProblemService = UserProblemService.getInstance();
		this.contestRepository = AppDataSource.getRepository(Contest);
	}
	
	public static getInstance() {
		if (!UserContestService.instance) {
			UserContestService.instance = new UserContestService();
		}
		return UserContestService.instance;
	}
	
	async getAll(query: any = {}) {
		const {page = 0, limit = 10} = query;
		const options: FindManyOptions = {
			take: +limit,
			skip: +page * +limit,
			relations: ['contest'],
			order: {createdAt: 'DESC'},
			where: {}
		};
		
		if(query.userId) {
			options.where = {
				...options.where,
				userId: +query.userId
			}
		}
		
		if(query.contestId) {
			options.where = {
				...options.where,
				contestId: +query.contestId
			}
		}
		
		if(query.isPublic && ['true', 'false'].includes(query.isPublic)) {
			options.where = {
				...options.where,
				contest: {
					isPublic: query.isPublic === 'true'
				}
			}
		}
		
		if(query.q) {
			options.where = {
				...options.where,
				contest: {
					name: ILike(`%${query.q}%`)
				}
			}
		}
		
		const result = await this.userContestRepository.findAndCount(options);
		return toPageDTO(result, +page, +limit);
	}
	
	async getOne(query: any = {}) {
		return await this.userContestRepository.findOne({
			where: query,
			relations: ['contest']
		});
	}
	
	async createMany(body: {
		email: string,
		contestIds: number[]
	}) {
		const user = await this.userRepository.findOneBy({
			email: body.email.toLowerCase()
		})
		
		if(!user) {
			throw new Error('User not found');
		}
		
		const userContests = await Promise.all(body.contestIds.map(async (contestId) => {
			const userContestExist = await this.userContestRepository.findOneBy({userId: user.id, contestId});
			if(userContestExist) {
				return userContestExist;
			}
			const userContest = new UserContest();
			userContest.userId = user.id;
			userContest.contestId = contestId;
			
			// create user problem
			await this.userProblemService.createMany({userId: user.id, contestId});
			return userContest;
		}));
		
		return await this.userContestRepository.save(userContests);
	}
	
	async initPublicContest(user: User) {
		const publicContest = await this.contestRepository.findBy({
			isPublic: true
		});
		
		if(publicContest.length <= 0) {
			return;
		}
		
		const userContests = await Promise.all(publicContest.map(async contest => {
			const userContestExist = await this.userContestRepository.findOneBy({userId: user.id, contestId: contest.id});
			if(userContestExist) {
				return userContestExist;
			}
			const userContest = new UserContest();
			userContest.userId = user.id;
			userContest.contestId = contest.id;
			
			// create user problem
			await this.userProblemService.createMany({userId: user.id, contestId: contest.id});
			return await this.userContestRepository.save(userContest);
		}));
		
		if(userContests.length > 0) {
			return await this.userContestRepository.save(userContests);
		}
	}
}

export {UserContestService};

export default new Elysia().decorate('userContestService', UserContestService.getInstance());