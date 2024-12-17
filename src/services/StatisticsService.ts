import {FindManyOptions, Repository} from "typeorm";
import {Contest, Problem, Submission, User} from "../entities";
import {AppDataSource} from "../data-source";
import {Elysia} from "elysia";

class StatisticsService {
	private readonly submissionRepository: Repository<Submission>;
	private readonly contestRepository: Repository<Contest>;
	private readonly userRepository: Repository<User>;
	private readonly problemRepository: Repository<Problem>;
	
	constructor() {
		this.submissionRepository = AppDataSource.getRepository(Submission);
		this.contestRepository = AppDataSource.getRepository(Contest);
		this.userRepository = AppDataSource.getRepository(User);
		this.problemRepository = AppDataSource.getRepository(Problem);
	}
	
	async getStatistics() {
		const totalSubmissions = await this.submissionRepository.count();
		const totalContests = await this.contestRepository.count();
		const totalUsers = await this.userRepository.count();
		const totalProblems = await this.problemRepository.count();
		
		return {
			totalSubmissions,
			totalContests,
			totalUsers,
			totalProblems,
		};
	}
	
	async getTopUsers(query: any = {}) {
		const {limit = 5} = query;
		const options: FindManyOptions = {
			take: +limit,
			order: {
				totalScore: 'DESC',
				totalSolved: 'DESC',
			}
		};
		
		const res = await this.userRepository.find(options);
		return res.map(user => user.toApiResponse());
	}
	
	async getRecentContests(query: any = {}) {
		const {limit = 5} = query;
		const options: FindManyOptions = {
			take: +limit,
			order: {
				createdAt: 'DESC',
			}
		};
		
		return await this.contestRepository.find(options);
	}
	
	async getRecentProblem(query: any = {}) {
		const {limit = 5} = query;
		const options: FindManyOptions = {
			take: +limit,
			order: {
				createdAt: 'DESC',
			}
		};
		
		return await this.problemRepository.find(options);
	}
}

export default new Elysia().decorate('statisticsService', new StatisticsService());