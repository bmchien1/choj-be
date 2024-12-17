import {JoinContestRequest, User} from "../entities";
import {FindManyOptions, ILike, In, Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import {toPageDTO} from "../utils";
import {UserContestService} from "./UserContestService";
import {Elysia} from "elysia";

class JoinContestRequestService {
    private readonly joinContestRequestRepository: Repository<JoinContestRequest>;
    private static instance: JoinContestRequestService;
    private readonly userContestService: UserContestService;

    constructor() {
        this.joinContestRequestRepository = AppDataSource.getRepository(JoinContestRequest);
        this.userContestService = UserContestService.getInstance();
    }

    public static getInstance() {
        if (!JoinContestRequestService.instance) {
            JoinContestRequestService.instance = new JoinContestRequestService();
        }
        return JoinContestRequestService.instance;
    }

    async getAll(query: any = {}) {
        const {page = 0, limit = 10} = query;
        const options: FindManyOptions = {
            take: +limit,
            skip: +page * +limit,
            where: {},
            relations: ['contest', 'user'],
            order: {createdAt: 'DESC'}
        };

        if(query.email) {
            options.where = {
                ...options.where,
                user: {
                    email: ILike(`%${query.email}%`)
                }
            }
        }

        if(query.contestId) {
            options.where = {
                ...options.where,
                contestId: +query.contestId
            }
        }
        
        if(query.listContestIds) {
            let contestIds: number[];
            
            if (typeof query.listContestIds === 'string') {
                contestIds = query.listContestIds.split(',').map((id: string) => +id);
            } else if (Array.isArray(query.listContestIds)) {
                contestIds = query.listContestIds.map((id: string) => +id);
            } else {
                contestIds = [];
            }
            
            if (contestIds.length > 0) {
                options.where = {
                    ...options.where,
                    contestId: In(contestIds)
                }
            }
        }

        if(query.status && [0, 1, 2].includes(+query.status)) {
            options.where = {
                ...options.where,
                status: +query.status
            }
        }

        const [result, total] = await this.joinContestRequestRepository.findAndCount(options);

        return toPageDTO([result, total], +page, +limit);
    }

    async approve(id: number) {
        const joinContestRequest = await this.joinContestRequestRepository.findOne({
            where: {id},
            relations: ['user']
        });

        if(!joinContestRequest) {
            throw new Error('Join contest request not found');
        }

        const userContest = await this.userContestService.createMany({
            email: joinContestRequest.user.email,
            contestIds: [joinContestRequest.contestId]
        })

        await this.joinContestRequestRepository.update({id}, {status: 1});

        return userContest;
    }

    async reject(id: number) {
        const joinContestRequest = await this.joinContestRequestRepository.findOne({
            where: {id}
        });

        if(!joinContestRequest) {
            throw new Error('Join contest request not found');
        }

        await this.joinContestRequestRepository.update({id}, {status: 2});
        return {message: 'Join contest request rejected'};
    }
    
    async create(user: User, body: {
        contestId: number
    }) {
        const {contestId} = body;
        //check if user already joined contest
        const userContest = await this.userContestService.getOne({
            userId: user.id,
            contestId: contestId
        });
        
        if(userContest) {
            throw new Error('User already joined contest');
        }
        
        // check if user already requested to join contest
        const joinContestRequest = await this.joinContestRequestRepository.findOne({
            where: {
                userId: user.id,
                contestId: contestId,
                status: 0
            }
        });
        
        if(joinContestRequest) {
            throw new Error('User already requested to join contest');
        }
        
        const newJoinContestRequest = new JoinContestRequest();
        newJoinContestRequest.user = user;
        newJoinContestRequest.contestId = contestId;
        newJoinContestRequest.status = 0;
        
        return this.joinContestRequestRepository.save(newJoinContestRequest);
    }
}

export default new Elysia().decorate('joinContestRequestService', JoinContestRequestService.getInstance());