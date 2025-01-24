import {Elysia} from "elysia";
import {FindManyOptions, ILike, Repository} from "typeorm";
import {User} from "../entities/User";
import {AppDataSource} from "../data-source";
import * as bycrypt from 'bcrypt'
import {AppRole} from "../types";
import {toPageDTO} from "../utils";

class UserService {
  private readonly userRepository: Repository<User>;
  private static instance: UserService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }
  
  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  async register(body: { email: string, password: string}) {
    const emailLowerCase = body.email.toLowerCase();
    const existUser = await this.userRepository.findOneBy({email: emailLowerCase});
    if (existUser) {
      throw new Error('User already exists')
    }
    const user = new User();
    user.role = AppRole.USER;
    user.email = emailLowerCase;
    //hash password
    user.password = bycrypt.hashSync(body.password, 10);
    
    const savedUser = await this.userRepository.save(user);
    
    //send email
    return savedUser.toApiResponse();
  }

  async login(body: { email: string, password: string }, jwt: any) {
    const emailToLower = body.email.toLowerCase();
    const user = await this.userRepository.findOneBy({email: emailToLower});    
    console.log(user?.password)

    console.log(emailToLower)
    console.log(body.password)
    if (!user) {
      throw new Error('User not found')
    }
    if (!bycrypt.compareSync(body.password, user.password)) {
      throw new Error('Password is incorrect')
    }
    const token = await jwt.sign({id: user.id, email: emailToLower, role: user.role});
    return {
      jwt: token,
      user: user.toApiResponse(),
    }
  }
  
  async changePassword(user: User, body: { oldPassword: string, newPassword: string }) {
    if (!bycrypt.compareSync(body.oldPassword, user.password)) {
      throw new Error('Old password is incorrect')
    }
    user.password = bycrypt.hashSync(body.newPassword, 10);
    const savedUser = await this.userRepository.save(user);
    return savedUser.toApiResponse();
  };
  
  async updateAdmin(body: {userId: number, role?: string}) {
    const user = await this.userRepository.findOneBy({id: body.userId});
    if (!user) {
      throw new Error('User not found')
    }
    if(body.role && !Object.values(AppRole).includes(body.role as AppRole)) {
      throw new Error('Invalid role')
    }
    if(body.role) {
      user.role = body.role as AppRole;
    }
    const savedUser = await this.userRepository.save(user);
    return savedUser.toApiResponse();
  }

  async getOne(query: any = {}) {
    const user = await this.userRepository.findOneBy(query);
    if (!user) {
      throw new Error('User not found')
    }
    return user
  }
  
  async getAll(query: any = {}) {
    const {page = 0, limit = 10} = query
    const options: FindManyOptions = {
      take: +limit,
      skip: +page * +limit,
      where: {},
      order: {createdAt: 'DESC'}
    }
    
    if(query.email) {
      options.where = {
        ...options.where,
        email: ILike(`%${query.email}%`)
      }
    }
    
    if(query.isVerified && ["true", "false"].includes(query.isVerified)) {
      options.where = {
        ...options.where,
        isVerified: query.isVerified === "true"
      }
    }
    
    if(query.role) {
      options.where = {
        ...options.where,
        role: query.role
      }
    }
    
    const [result, total] = await this.userRepository.findAndCount(options);
    
    return toPageDTO([result, total], +page, +limit);
  }
}

export {UserService}

export default new Elysia()
  .decorate('userService', UserService.getInstance());