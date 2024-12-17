import {FindManyOptions, ILike, Like, Repository} from "typeorm";
import {Contest, Problem, ProblemTag, ProblemTestCase, User, UserProblem} from "../entities";
import {ContestService} from "./ContestService";
import {AppDataSource} from "../data-source";
import {toPageDTO} from "../utils";
import {ProblemDifficulty} from "../types";
import {Elysia} from "elysia";

class ProblemService {
	private readonly problemRepository: Repository<Problem>;
	private static instance: ProblemService;
	private readonly contestService: ContestService;
	private readonly problemTagRepository: Repository<ProblemTag>;
	private readonly problemTestCaseRepository: Repository<ProblemTestCase>;
	private readonly userRepository: Repository<User>;
	private readonly userProblemRepository: Repository<UserProblem>;
	
	constructor() {
		this.problemRepository = AppDataSource.getRepository(Problem);
		this.problemTagRepository = AppDataSource.getRepository(ProblemTag);
		this.contestService = ContestService.getInstance();
		this.problemTestCaseRepository = AppDataSource.getRepository(ProblemTestCase);
		this.userRepository = AppDataSource.getRepository(User);
		this.userProblemRepository = AppDataSource.getRepository(UserProblem);
	}
	
	public static getInstance() {
		if (!ProblemService.instance) {
			ProblemService.instance = new ProblemService();
		}
		return ProblemService.instance;
	}
	
	async getAll(query: any = {}) {
		const {page = 0, limit = 10} = query;
		const options: FindManyOptions = {
			take: +limit,
			skip: +page * +limit,
			order: {createdAt: 'DESC'},
			where: {},
			relations: ["testCases", "contest"]
		};
		
		if (query.contestId) {
			options.where = {
				...options.where,
				contestId: +query.contestId
			}
		}
		
		if (query.problemName) {
			options.where = {
				...options.where,
				problemName: ILike(`%${query.problemName}%`)
			}
		}
		
		if (query.problemCode) {
			options.where = {
				...options.where,
				problemCode: ILike(`%${query.problemCode}%`)
			}
		}
		
		if (query.difficulty) {
			options.where = {
				...options.where,
				difficulty: query.difficulty as ProblemDifficulty
			}
		}
		
		const [result, total] = await this.problemRepository.findAndCount(options);
		const formattedResult = result.map(problem => {
			return {
				...problem.toApiResponse(),
				testCases: problem.testCases.map(testCase => {
					return testCase.toApiResponse(query?.isHide);
				})
			}
		});
		return toPageDTO([formattedResult, total], +page, +limit);
	}
	
	async getOne(query: any = {}) {
		const queryWithoutIsHide = {...query};
		delete queryWithoutIsHide.isHide;
		const result = await this.problemRepository.findOne({
			where: queryWithoutIsHide,
			relations: ['testCases', 'contest']
		});
		if (!result) {
			throw new Error('Problem not found');
		}
		
		return {
			...result.toApiResponse(),
			testCases: result.testCases.map(testCase => {
				return testCase.toApiResponse(query?.isHide);
			})
		}
	}
	
	async create(body: {
		problemName: string,
		problemCode: string,
		difficulty: string,
		maxPoint: number,
		contestId: number,
		problemStatement: string,
		tags?: string[],
		testCases: {
			input: string,
			output: string,
			hidden?: number,
		}[],
		cpuTimeLimit?: number,
		memoryLimit?: number,
		maxTimeCommit?: number,
	}) {
		const contestExist = await this.contestService.getOne({id: body.contestId});
		
		const problem = new Problem();
		problem.problemName = body.problemName;
		problem.problemCode = body.problemCode;
		problem.difficulty = body.difficulty as ProblemDifficulty;
		problem.maxPoint = body.maxPoint;
		problem.contestId = contestExist.id;
		problem.problemStatement = body.problemStatement;
		problem.testCases = [];

		if (body.cpuTimeLimit) {
			problem.cpuTimeLimit = body.cpuTimeLimit;
		}

		if (body.memoryLimit) {
			problem.memoryLimit = body.memoryLimit;
		}
		
		if(body.maxTimeCommit) {
			problem.maxTimeCommit = body.maxTimeCommit;
		}

		let tags = [];
		for(const tag of body.tags || []) {
			const tagNameLower = tag.toLowerCase();
			const tagExist = await this.problemTagRepository.findOneBy({tagName: tagNameLower});
			if (!tagExist) {
				throw new Error(`Tag name ${tagNameLower} not found`);
			}

			tags.push(tagNameLower);
		}

		problem.tags = tags.join(',');

		const saveProblem = await this.problemRepository.save(problem);
		let testCases = []
		for (let i = 0; i < body.testCases.length; i++) {
			const testCase = new ProblemTestCase();
			testCase.input = body.testCases[i].input;
			testCase.output = body.testCases[i].output;
			
			if(body.testCases[i].hidden) {
				testCase.hidden = body.testCases[i].hidden || 0;
			}
			testCase.problemId = saveProblem.id;
			testCases.push(testCase);
		}
		await this.problemTestCaseRepository.save(testCases);

		await this.onCreateUserProblem(saveProblem, contestExist);

		return saveProblem.toApiResponse();
	}
	
	async update(id: number, body: {
		problemName?: string,
		problemCode?: string,
		difficulty?: string,
		maxPoint?: number,
		contestId?: number,
		problemStatement?: string,
		tags?: string[],
		testCases?: {
			input: string,
			output: string,
			hidden?: number,
		}[],
		cpuTimeLimit?: number,
		memoryLimit?: number,
		maxTimeCommit?: number,
	}) {
		const problem = await this.problemRepository.findOneBy({id});
		
		if (!problem) {
			throw new Error('Problem not found');
		}
		
		if (body.problemName) {
			problem.problemName = body.problemName;
		}
		
		if (body.problemCode) {
			problem.problemCode = body.problemCode;
		}
		
		if (body.difficulty) {
			problem.difficulty = body.difficulty as ProblemDifficulty;
		}
		
		if (body.maxPoint) {
			problem.maxPoint = body.maxPoint;
		}
		
		if (body.contestId) {
			const contestExist = await this.contestService.getOne({id: body.contestId});
			
			if (!contestExist) {
				throw new Error('Contest not found');
			}
			
			problem.contestId = body.contestId;
		}
		
		if (body.problemStatement) {
			problem.problemStatement = body.problemStatement;
		}
		
		if(body.maxTimeCommit) {
			problem.maxTimeCommit = body.maxTimeCommit;
		}
		
		if (body.tags) {
			let tags = [];
			for(const tag of body.tags) {
				const tagNameLower = tag.toLowerCase();
				const tagExist = await this.problemTagRepository.findOneBy({tagName: tagNameLower});
				if (!tagExist) {
					throw new Error(`Tag name ${tagNameLower} not found`);
				}

				tags.push(tagNameLower);
			}

			problem.tags = tags.join(',');
		}

		if(body.cpuTimeLimit) {
			problem.cpuTimeLimit = body.cpuTimeLimit;
		}

		if(body.memoryLimit) {
			problem.memoryLimit = body.memoryLimit;
		}

		if (body.testCases) {
			// delete all old test cases
			await this.problemTestCaseRepository.delete({problemId: problem.id});
			let newTestCases = [];
			for(const testCase of body.testCases) {
				const problemTestCase = new ProblemTestCase();
				problemTestCase.input = testCase.input;
				problemTestCase.output = testCase.output;
				problemTestCase.problemId = problem.id;
				
				if(testCase.hidden) {
					problemTestCase.hidden = testCase.hidden || 0;
				}
				
				newTestCases.push(problemTestCase);
			}
			
			await this.problemTestCaseRepository.save(newTestCases);
		}
		
		return (await this.problemRepository.save(problem)).toApiResponse();
	}
	
	async delete(id: number) {
		const problem = await this.problemRepository.findOneBy({id});
		
		if (!problem) {
			throw new Error('Problem not found');
		}
		
		await this.problemRepository.delete({id});
		
		return {
			ok: true,
			problem: problem.toApiResponse()
		}
	}
	
	async softDelete(id: number) {
		const problem = await this.problemRepository.findOneBy({id});
		
		if (!problem) {
			throw new Error('Problem not found');
		}
		
		await this.problemRepository.softDelete({id});
		
		return {
			ok: true,
			problem: problem.toApiResponse()
		}
	}
	
	async restore(id: number) {
		const problem = await this.problemRepository.findOne({
			where: {id},
			withDeleted: true
		});
		
		if (!problem) {
			throw new Error('Problem not found');
		}
		
		await this.problemRepository.restore({id});
		
		return {
			ok: true,
			problem: problem.toApiResponse()
		}
	}

	async onCreateUserProblem(problem: Problem, contest: Contest) {
		if (contest.isPublic) {
			// create user problem for all users if contest is public
			const users = await this.userRepository.find();
			const userProblems = users.map(user => {
				const userProblem = new UserProblem();
				userProblem.problemId = problem.id;
				userProblem.userId = user.id;
				userProblem.contestId = contest.id;
				return userProblem;
			});
			await this.userProblemRepository.save(userProblems);
			console.log("Create problem for all users in this public contest")
		} else {
			// create user problem for all users who join this contest
			const userContests = await this.userProblemRepository.find({
				where: {
					contestId: contest.id
				}
			});

			const userProblems = userContests.map(userContest => {
				const userProblem = new UserProblem();
				userProblem.problemId = problem.id;
				userProblem.userId = userContest.userId;
				userProblem.contestId = contest.id;
				return userProblem;
			});

			await this.userProblemRepository.save(userProblems);
			console.log("Create problem for all users who join this contest")
		}
	}
}

export {ProblemService};

export default new Elysia().decorate('problemService', ProblemService.getInstance());