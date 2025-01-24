import Redis from 'ioredis';
import { AppDataSource } from "../data-source";
import { Submission } from "../entities/Submission";
import { SubmissionStatus } from "../types";
import { base64Decode, getSubmissionStatus } from "../utils";
import Decimal from "decimal.js";
import CompilerService from './CompilerService';


class RedisService {
    private static instance: RedisService;
    private readonly publisher: Redis;
    private readonly subscriber: Redis;
    private readonly compilerService: CompilerService;

    private constructor() {
        const redisConfig = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT as string) || 6379,
            password: process.env.REDIS_PASSWORD || undefined,
            retryStrategy: (times: number) => Math.min(times * 50, 2000),
        };

        this.publisher = new Redis(redisConfig);
        this.subscriber = new Redis(redisConfig);
        this.compilerService = CompilerService.getInstance();
        this.initialize();
    }

    private async initialize() {
        this.subscriber.subscribe('submission');
        this.subscriber.on('message', async (channel, message) => {
            if (channel === 'submission') {
                const tokens = JSON.parse(message);
                await this.processSubmissions(tokens);
            }
        });
    }

    private async processSubmissions(tokens: string[]) {
        for (let i = 0; i < 10; i++) {
            const { submissions } = await this.compilerService.getSubmissionsBatch(tokens);
            if (submissions.every((sub: { status: { id: number; }; }) => sub.status.id > 2)) {
                await this.updateSubmissionResults(tokens, submissions);
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    private async updateSubmissionResults(tokens: string[], results: any[]) {
        const submissionRepository = AppDataSource.getRepository(Submission);
        const submission = await submissionRepository.findOne({ where: { listSubmissionToken: tokens.join(',') } });

        if (!submission) return;

        let totalPassed = 0;
        results.forEach((res, idx) => {
            if (getSubmissionStatus(res.status.id) === SubmissionStatus.ACCEPTED) totalPassed++;
        });

        submission.status = totalPassed === results.length ? SubmissionStatus.ACCEPTED : SubmissionStatus.FAILED;
        submission.score = new Decimal((totalPassed / results.length) * submission.question.maxPoint).toNumber();
        await submissionRepository.save(submission);
    }

    public async addSubmissionEvent(tokens: string[]) {
        await this.publisher.publish('submission', JSON.stringify(tokens));
    }

    public static getInstance(): RedisService {
        if (!RedisService.instance) {
            RedisService.instance = new RedisService();
        }
        return RedisService.instance;
    }
}


export default RedisService;
