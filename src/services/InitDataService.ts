import {Contest, User} from "../entities";
import {Repository} from "typeorm";
import {AppDataSource} from "../data-source";
import * as bcrypt from "bcrypt";
import {AppRole, ContestStatus} from "../types";
import {ContestService} from "./ContestService";

class InitDataService {
	private readonly userRepository: Repository<User>;
	private static instance: InitDataService;
	private readonly contestService: ContestService
	
	constructor() {
		this.userRepository = AppDataSource.getRepository(User);
		this.contestService = ContestService.getInstance();
	}
	
	public static getInstance() {
		if (!InitDataService.instance) {
			InitDataService.instance = new InitDataService();
		}
		return InitDataService.instance;
	}
	
	public async initAdminAccount() {
		const email = process.env.ADMIN_EMAIL || 'binhtruong9418@gmail.com';
		const password = process.env.ADMIN_PASSWORD || 'Admin@1234';
		
		const adminExist = await this.userRepository.findOne({
			where: {
				email: email
			}
		});
		
		if (adminExist && adminExist.role === 'admin') {
			console.log('Admin account already exists');
			return;
		}
		
		if(adminExist && adminExist.role !== 'admin') {
			await this.userRepository.remove(adminExist);
		}
		
		const admin = new User();
		admin.email = email;
		admin.password = bcrypt.hashSync(password, 10);
		admin.role = AppRole.ADMIN;
		
		await this.userRepository.save(admin);
		console.log('Admin account created');
	}

	public async initPublicContest() {
		const contestExist = await this.contestService.getAll({isPublic: 'true'});

		if(contestExist.contents.length > 0) {
			console.log('Public contest already exists');
			return;
		}

		await this.contestService.create({
			contestName: 'Public contest',
			creator: 'Admin',
			isPublic: true,
			description: 'Public contest'
		});
		console.log('Public contest created');
	}
}

export default InitDataService;