import Redis from 'ioredis';
import {CompilerService} from "./CompilerService";
import {In, Repository} from "typeorm";
import {Submission, SubmissionTestCase, User, UserProblem} from "../entities";
import {AppDataSource} from "../data-source";
import {SubmissionStatus} from "../types";
import {base64Decode, getSubmissionStatus} from "../utils";
import Decimal from "decimal.js";

class RedisService {
    private static instance: RedisService;
    private readonly publisher: Redis;
    private readonly subscriber: Redis;
    private readonly compilerService: CompilerService;
    private readonly submissionRepository: Repository<Submission>;
    private readonly submissionTestCaseRepository: Repository<SubmissionTestCase>;
    private readonly userProblemRepository: Repository<UserProblem>;
    private readonly userRepository: Repository<User>;

    constructor() {
        const redisConfig = {
            host: process.env.REDIS_HOST || '192.168.2.1',
            port: parseInt(process.env.REDIS_PORT as string) || 14906,
            password: process.env.REDIS_PASSWORD || 'password',
            retryStrategy: (times: number) => {
                return Math.min(times * 50, 2000);
            },
            maxRetriesPerRequest: 3,
        };

        this.publisher = new Redis(redisConfig);
        this.subscriber = new Redis(redisConfig);

        this.compilerService = CompilerService.getInstance();
        this.submissionRepository = AppDataSource.getRepository(Submission);
        this.submissionTestCaseRepository = AppDataSource.getRepository(SubmissionTestCase);
        this.userProblemRepository = AppDataSource.getRepository(UserProblem);
        this.userRepository = AppDataSource.getRepository(User);

        this.initialize();
    }

    private async initialize() {
        // Xử lý các sự kiện kết nối
        this.publisher.on('error', (err) => console.error('Redis Publisher Error:', err));
        this.subscriber.on('error', (err) => console.error('Redis Subscriber Error:', err));

        this.publisher.on('connect', () => console.log('Redis Publisher Connected'));
        this.subscriber.on('connect', () => console.log('Redis Subscriber Connected'));

        // Subscribe vào channel submission
        await this.subscriber.subscribe('submission');

        // Xử lý message từ subscription
        this.subscriber.on('message', async (channel: string, message: string) => {
            try {
                if (channel === 'submission') {
                    const listSubmissionTokens = JSON.parse(message);
                    await this._processSubmissionForTask(listSubmissionTokens);
                }
            } catch (error) {
                console.error(`Error processing submission:`, error);
            }
        });

        console.log('Redis service initialized successfully');
    }

    async _processSubmissionForTask(listSubmissionTokens: string[]) {
        try {
            const maxRetries = 10;
            const delayMs = 1000;

            for (let retry = 0; retry < maxRetries; retry++) {
                const {submissions: submissionBatchResult} =
                    await this.compilerService.getSubmissionsBatch(listSubmissionTokens);

                let needsRetry = false;

                for (const submissionBatch of submissionBatchResult) {
                    if (submissionBatch.status.id === 1 || submissionBatch.status.id === 2) {
                        needsRetry = true;
                        break;
                    }
                }

                if (!needsRetry) {
                    console.log("All submissions are done");
                    const submissionTokenString = listSubmissionTokens.join(',');
                    const submission = await this.submissionRepository.findOne({
                        where: {
                            listSubmissionToken: submissionTokenString
                        },
                        relations: ['problem', 'problem.testCases']
                    });

                    if (submission) {
                        await this._updateSubmission(submission, submissionBatchResult);
                    }
                    break;
                }

                if (retry < maxRetries - 1) {
                    await new Promise(resolve => setTimeout(resolve, delayMs));
                }
            }
        } catch (e) {
            console.error('Error processing submission task:', e);
            throw e;
        }
    }

    async _updateSubmission(submission: Submission, submissionBatchResult: any[]) {
        try {
            const listSubmissionTestCases = await this.submissionTestCaseRepository.find({
                where: {
                    submissionId: submission.id,
                    id: In(submissionBatchResult.map(submission => submission.token))
                }
            })
            if (!listSubmissionTestCases.length) {
                return;
            }
            let totalTestCasePassed = 0;
            let submissionError = '';
            let submissionStatus = SubmissionStatus.PENDING;
            let submissionMessage = '';
            for (let i = 0; i < submissionBatchResult.length; i++) {
                const submissionBatch = submissionBatchResult[i];
                const testCaseSubmission = listSubmissionTestCases[i];

                if (getSubmissionStatus(submissionBatch.status.id) === SubmissionStatus.COMPILATION_ERROR) {
                    submissionStatus = SubmissionStatus.COMPILATION_ERROR;
                    submissionError = base64Decode(submissionBatch.compile_output);
                    break;
                }

                if (getSubmissionStatus(submissionBatch.status.id) === SubmissionStatus.PENDING) {
                    submissionStatus = SubmissionStatus.PENDING;
                    break;
                }

                if (getSubmissionStatus(submissionBatch.status.id) === SubmissionStatus.PARTIAL) {
                    testCaseSubmission.message = submissionBatch.status.description;
                    testCaseSubmission.isSuccess = false;
                    testCaseSubmission.userOutput = base64Decode(submissionBatch.stdout).trim();
                }

                if (getSubmissionStatus(submissionBatch.status.id) === SubmissionStatus.ACCEPTED) {
                    const userOutput = base64Decode(submissionBatch.stdout).trim();
                    if (userOutput === testCaseSubmission.expectedOutput) {
                        totalTestCasePassed++;
                        testCaseSubmission.userOutput = userOutput;
                        testCaseSubmission.point = new Decimal(submission.problem.maxPoint / listSubmissionTestCases.length).toDecimalPlaces(2).toNumber();
                        testCaseSubmission.message = 'Accepted';
                    } else {
                        testCaseSubmission.message = 'Wrong Answer';
                    }
                    testCaseSubmission.isSuccess = true;
                }
            }

            if (submissionError) {
                submissionStatus = SubmissionStatus.COMPILATION_ERROR;
                listSubmissionTestCases.forEach(testCase => {
                    testCase.message = 'Compilation Error';
                    testCase.isSuccess = false;
                })
            }

            if (totalTestCasePassed === listSubmissionTestCases.length) {
                submissionStatus = SubmissionStatus.ACCEPTED;
                submissionMessage = 'Accepted';
            }

            if (totalTestCasePassed > 0 && totalTestCasePassed < listSubmissionTestCases.length) {
                submissionStatus = SubmissionStatus.PARTIAL;
                submissionMessage = 'Partial'
            }

            if (totalTestCasePassed === 0) {
                submissionStatus = SubmissionStatus.FAILED;
                listSubmissionTestCases.forEach(testCase => {
                    testCase.message = 'Wrong Answer';
                    testCase.isSuccess = false;
                })
                submissionMessage = 'Failed'

            }

            submission.testCasePassed = totalTestCasePassed;
            submission.error = submissionError;
            submission.status = submissionStatus;
            submission.point = new Decimal(totalTestCasePassed * submission.problem.maxPoint / listSubmissionTestCases.length).toDecimalPlaces(2).toNumber();
            submission.message = submissionMessage;

            const userProblem = await this.userProblemRepository.findOne({
                where: {
                    userId: submission.userId,
                    problemId: submission.problemId
                }
            })

            if (userProblem) {
                if (submissionStatus === SubmissionStatus.ACCEPTED && !userProblem.accepted) {
                    await this.updateUserScore(
                        submission.userId,
                        submission.problem.maxPoint,
                        submissionStatus === SubmissionStatus.ACCEPTED
                    );
                }
                userProblem.maxSubmittedPoint = Math.max(userProblem.maxSubmittedPoint, submission.point);
                userProblem.accepted = userProblem.accepted ? true : submissionStatus === SubmissionStatus.ACCEPTED;
                await this.userProblemRepository.save(userProblem);
            }

            await this.submissionRepository.save(submission);
            await this.submissionTestCaseRepository.save(listSubmissionTestCases);
            console.log('Submission updated');
        } catch (error) {
            console.error('Error updating submission:', error);
        }
    }

    async updateUserScore(userId: number, increaseScore: number, isAccepted: boolean) {
        const user = await this.userRepository.findOne({
            where: {
                id: userId
            },
        });

        if (!user) {
            return;
        }

        user.totalScore += increaseScore;
        if (isAccepted) {
            user.totalSolved++;
        }

        await this.userRepository.save(user);
    }

    static getInstance() {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }

    public async addSubmissionEvent(listSubmissionTokens: string[]) {
        try {
            // Publish event
            await this.publisher.publish('submission', JSON.stringify(listSubmissionTokens));

            console.log('Added submission job:', listSubmissionTokens);
            return true;
        } catch (error) {
            console.error('Error adding submission event:', error);
            throw error;
        }
    }

    public async cleanup() {
        await Promise.all([
            this.publisher.quit(),
            this.subscriber.quit(),
        ]);
    }
}

export default RedisService;