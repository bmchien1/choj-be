import {Contest, User, UserProblem} from "../entities";
import {Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {toPageDTO} from "../utils";
import {ContestService} from "./ContestService";
import {ProblemService} from "./ProblemService";
import {UserService} from "./UserService";
import {Elysia} from "elysia";

class UserProblemService {
	private static instance: UserProblemService;
	private readonly userProblemRepository: Repository<UserProblem>;
	private readonly contestService: ContestService;
	private readonly problemService: ProblemService;
	private readonly userRepository: Repository<User>;

	constructor() {
		this.userProblemRepository = AppDataSource.getRepository(UserProblem);
		this.contestService = ContestService.getInstance();
		this.problemService = ProblemService.getInstance();
		this.userRepository = AppDataSource.getRepository(User);
	}

	public static getInstance() {
		if (!UserProblemService.instance) {
			UserProblemService.instance = new UserProblemService();
		}
		return UserProblemService.instance;
	}

	public async getAll(query: any = {}) {
		const {page = 0, limit = 10} = query;
		const options: any = {
			take: +limit,
			skip: +page * +limit,
			where: {},
			relations: ['problem', 'problem.testCases'],
			order: {createdAt: 'DESC'}
		};

		if (query.userId) {
			options.where = {
				...options.where,
				userId: +query.userId
			}
		}

		if (query.contestId) {
			options.where = {
				...options.where,
				contestId: +query.contestId
			}
		}

		const [result, total] = await this.userProblemRepository.findAndCount(options);
		const formattedResult = result.map((userProblem) => {
			return {
				...userProblem,
				problem: {
					...userProblem.problem.toApiResponse(),
					testCases: userProblem.problem.testCases.map((testCase) => {
						return testCase.toApiResponse(query?.isHide)
					})
				}
			}
		})
		return toPageDTO([formattedResult, total], +page, +limit);
	}

	public async getOne(query: any = {}) {
		const queryWithoutIsHide = {...query};
		delete queryWithoutIsHide.isHide;
		const userProblem = await this.userProblemRepository.findOne({
			where: queryWithoutIsHide,
			relations: ['problem', 'problem.testCases']
		});

		if(!userProblem) {
			throw new Error('User problem not found');
		}

		return {
			...userProblem,
			problem: {
				...userProblem.problem.toApiResponse(),
				testCases: userProblem.problem.testCases.map((testCase) => {
					return testCase.toApiResponse(query?.isHide)
				})
			}
		};
	}

	public async createMany(body: { userId: number, contestId: number }) {
		const {userId, contestId} = body;
		const user = await this.userRepository.findOneBy({id: userId});
		if(!user) {
			throw new Error('User not found');
		}
		const contest = await this.contestService.getOne({id: contestId});

		const {contents: problems} = await this.problemService.getAll({
			contestId: contestId,
			page: 0,
			limit: 1000
		});

		const userProblems = await Promise.all(problems.map(async (problem) => {
			const userProblemExist = await this.userProblemRepository.findOne({
				where: {
					userId: user.id,
					problemId: problem.id,
					contestId: contest.id
				}
			});

			if (userProblemExist) {
				return userProblemExist;
			}

			const userProblem = new UserProblem();
			userProblem.userId = user.id;
			userProblem.problemId = problem.id;
			userProblem.contestId = contest.id;

			return userProblem;
		}));

		return await this.userProblemRepository.save(userProblems);
	}
}

export {UserProblemService};
export default new Elysia().decorate('userProblemService', UserProblemService.getInstance());