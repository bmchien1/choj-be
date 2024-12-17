import {ProblemTestCase, Submission, SubmissionTestCase, User, UserProblem} from "../entities";
import {FindManyOptions, ILike, Like, Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {ProblemService} from "./ProblemService";
import {base64Encode, formatObject, toPageDTO} from "../utils";
import {ContestService} from "./ContestService";
import {CompilerService} from "./CompilerService";
import {Elysia} from "elysia";
import {ContestStatus, SubmissionStatus} from "../types";
import RedisService from "./RedisService";

class SubmissionService {
	private static instance: SubmissionService;
	private readonly submissionRepository: Repository<Submission>;
	private readonly problemService: ProblemService;
	private readonly contestService: ContestService;
	private readonly compilerService: CompilerService;
	private readonly problemTestCaseRepository: Repository<ProblemTestCase>;
	private readonly redisService: RedisService;
	private readonly submissionTestCaseRepository: Repository<SubmissionTestCase>;
	private readonly userProblemRepository: Repository<UserProblem>;
	
	constructor() {
		this.submissionRepository = AppDataSource.getRepository(Submission);
		this.problemService = ProblemService.getInstance();
		this.contestService = ContestService.getInstance();
		this.compilerService = CompilerService.getInstance();
		this.problemTestCaseRepository = AppDataSource.getRepository(ProblemTestCase);
		this.redisService = RedisService.getInstance();
		this.submissionTestCaseRepository = AppDataSource.getRepository(SubmissionTestCase);
		this.userProblemRepository = AppDataSource.getRepository(UserProblem);
	}
	
	public static getInstance() {
		if (!SubmissionService.instance) {
			SubmissionService.instance = new SubmissionService();
		}
		return SubmissionService.instance;
	}
	
	async getAll(query: any = {}) {
		const {page = 0, limit = 10} = query;
		const options: FindManyOptions = {
			take: +limit,
			skip: +page * +limit,
			order: {createdAt: 'DESC'},
			relations: ['problem', 'testCases', 'user', 'contest'],
			where: {}
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
		
		if(query.problemId) {
			options.where = {
				...options.where,
				problemId: +query.problemId
			}
		}
		
		if (query.submissionHash) {
			options.where = {
				...options.where,
				submissionHash: Like(`%${query.submissionHash}%`)
			}
		}
		
		if (query.status) {
			options.where = {
				...options.where,
				status: query.status
			}
		}
		
		if(query.userEmail) {
			options.where = {
				...options.where,
				user: {
					email: ILike(`%${query.userEmail}%`)
				}
			}
		}
		
		const [result, total] = await this.submissionRepository.findAndCount(options);
		
		const formattedResult = result.map(submission => {
			return {
				...submission,
				user: submission.user.toApiResponse(),
				problem: {
					...submission.problem.toApiResponse(),
				},
				testCases: submission.testCases.map(testCase => {
					return testCase.toApiResponse(query?.isHide)
				})
			}
		})
		
		return toPageDTO([formattedResult, total], +page, +limit);
	}
	
	async getOne(query: any) {
		const queryWithoutIsHide = {...query};
		delete queryWithoutIsHide.isHide;
		const submission = await this.submissionRepository.findOne({
			where: queryWithoutIsHide,
			relations: ['problem', 'testCases', 'user', 'contest']
		});
		
		if (!submission) {
			throw new Error('Submission not found');
		}
		
		return {
			...submission,
			user: submission.user.toApiResponse(),
			problem: {
				...submission.problem.toApiResponse(),
			},
			testCases: submission.testCases.map(testCase => {
				return testCase.toApiResponse(query?.isHide)
			})
		};
	}
	
	async create(user: User, body: {
		problemId: number,
		contestId: number,
		languageId: number,
		sourceCode: string
	}) {
		const problem = await this.problemService.getOne({id: body.problemId});
		const contest = await this.contestService.getOne({id: body.contestId});
		
		const language = await this.compilerService.getLanguageById(body.languageId);
		
		const userProblem = await this.userProblemRepository.findOne({
			where: {
				userId: user.id,
				problemId: problem.id
			}
		});
		
		if (!userProblem) {
			throw new Error('User has not solved this problem');
		}
		
		if (contest.status !== ContestStatus.RUNNING) {
			throw new Error('Contest has ended');
		}
		
		if(userProblem.submittedCount && problem.maxTimeCommit && userProblem.submittedCount >= problem.maxTimeCommit) {
			throw new Error('User has reached the maximum number of submissions');
		}
		
		userProblem.submittedCount += 1;
		userProblem.submitted = true;
		
		await this.userProblemRepository.save(userProblem);
		
		const listTestCases = await this.problemTestCaseRepository.find({
			where: {
				problemId: problem.id
			}
		});
		
		if (!listTestCases.length) {
			throw new Error('Problem has no test case');
		}
		
		const encodedSourceCode = base64Encode(body.sourceCode);
		
		const encodedInputOutput = listTestCases.map(testCase => {
			return {
				input: base64Encode(testCase.input),
				output: base64Encode(testCase.output)
			}
		});
		
		const requestData = encodedInputOutput.map(io => {
			return formatObject({
				source_code: encodedSourceCode,
				language_id: language.id,
				stdin: io.input,
				memory_limit: problem.memoryLimit,
				cpu_time_limit: problem.cpuTimeLimit,
			})
		})
		
		const submissionBatch = await this.compilerService.createSubmissionsBatch(requestData)
		
		const submissionTokens = submissionBatch.map((submission: any, index: number) => submission.token);
		
		const submission = new Submission();
		submission.userId = user.id;
		submission.problemId = problem.id;
		submission.contestId = contest.id;
		submission.languageId = language.id;
		submission.submissionDate = new Date();
		submission.error = '';
		submission.submissionHash = crypto.randomUUID();
		submission.listSubmissionToken = submissionTokens.join(',');
		submission.status = SubmissionStatus.PENDING;
		submission.testCasePassed = 0;
		submission.point = 0;
		submission.message = '';
		submission.sourceCode = body.sourceCode;
		
		const savedSubmission = await this.submissionRepository.save(submission);
		for (let i = 0; i < listTestCases.length; i++) {
			const testCase = listTestCases[i];
			const submissionTestCase = new SubmissionTestCase();
			submissionTestCase.id = `${submissionTokens[i]}`;
			submissionTestCase.submissionId = savedSubmission.id;
			submissionTestCase.input = testCase.input;
			submissionTestCase.expectedOutput = testCase.output;
			submissionTestCase.userOutput = '';
			submissionTestCase.point = 0;
			submissionTestCase.isSuccess = false;
			submissionTestCase.hidden = testCase.hidden;
			await this.submissionTestCaseRepository.save(submissionTestCase);
		}

		await this.redisService.addSubmissionEvent(submissionTokens)
		
		return savedSubmission;
	}
}

export {SubmissionService};
export default new Elysia().decorate('submissionService', SubmissionService.getInstance());