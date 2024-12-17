import {Elysia} from "elysia";
import {FindManyOptions, ILike, Repository} from "typeorm";
import {User} from "../entities";
import {AppDataSource} from "../data-source";
import * as bycrypt from 'bcrypt'
import {AppRole} from "../types";
import {UserContestService} from "./UserContestService";
import MailService from "./MailService";
import {toPageDTO} from "../utils";

class UserService {
  private readonly userRepository: Repository<User>;
  private static instance: UserService;
  private readonly userContestService: UserContestService;
  private readonly mailService: MailService;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.userContestService = UserContestService.getInstance();
    this.mailService = MailService.getInstance();
  }
  
  public static getInstance() {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }
  
  private async generateToken() {
    const TIME = 15; // 15 minutes
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    const verificationCodeExpires = new Date(new Date().getTime() + TIME * 60000);
    const verificationCodeExpiresInMinutes = TIME;
    
    return {
      verificationCode,
      verificationCodeWithTime: verificationCode + '_' + verificationCodeExpires.getTime(),
      verificationCodeExpiresInMinutes
    }
  }
  
  private async verifyToken(token: string, code: string) {
    const [verificationCode, expires] = token.split('_');
    
    if(code !== verificationCode) {
      throw new Error('Invalid code')
    }
    
    if(new Date().getTime() > +expires) {
      throw new Error('Token expired')
    }
    
    return true;
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
    
    const {verificationCode, verificationCodeWithTime, verificationCodeExpiresInMinutes} = await this.generateToken();
    user.verificationToken = verificationCodeWithTime;
    user.isVerified = false;
    
    const savedUser = await this.userRepository.save(user);
    
    //send email
    await this.mailService.sendEmailVerification(savedUser.email, verificationCode, verificationCodeExpiresInMinutes);
    return savedUser.toApiResponse();
  }

  async login(body: { email: string, password: string }, jwt: any) {
    const emailToLower = body.email.toLowerCase();
    const user = await this.userRepository.findOneBy({email: emailToLower});
    if (!user) {
      throw new Error('User not found')
    }
    if (!bycrypt.compareSync(body.password, user.password)) {
      throw new Error('Password is incorrect')
    }
    if(!user.isVerified) {
      throw new Error('User is not verified')
    }
    const token = await jwt.sign({id: user.id, email: emailToLower, role: user.role});
    return {
      jwt: token,
      user: user.toApiResponse(),
    }
  }
  
  async resendVerificationEmail(body: { email: string }) {
    const emailToLower = body.email.toLowerCase();
    const user = await this.userRepository.findOneBy({email: emailToLower});
    if (!user) {
      throw new Error('User not found')
    }
    
    if(user.isVerified) {
      throw new Error('User is already verified')
    }
    
    const {verificationCode, verificationCodeWithTime, verificationCodeExpiresInMinutes} = await this.generateToken();
    user.verificationToken = verificationCodeWithTime;
    const savedUser = await this.userRepository.save(user);
    
    await this.mailService.sendEmailVerification(savedUser.email, verificationCode, verificationCodeExpiresInMinutes);
    return {
      ok: true,
      message: 'Email sent'
    }
  }
  
  async resendResetPasswordEmail(body: { email: string }) {
    const emailToLower = body.email.toLowerCase();
    const user = await this.userRepository.findOneBy({email: emailToLower});
    if (!user) {
      throw new Error('User not found')
    }
    
    const {verificationCode, verificationCodeWithTime, verificationCodeExpiresInMinutes} = await this.generateToken();
    user.resetPasswordToken = verificationCodeWithTime;
    const savedUser = await this.userRepository.save(user);
    
    await this.mailService.sendResetPasswordEmail(savedUser.email, verificationCode, verificationCodeExpiresInMinutes);
    return {
      ok: true,
      message: 'Email sent'
    }
  }
  
  async verifyEmail(body: { email: string, code: string }) {
    const emailToLower = body.email.toLowerCase();
    const user = await this.userRepository.findOneBy({email: emailToLower});
    if (!user) {
      throw new Error('User not found')
    }
    if(user.isVerified) {
      throw new Error('User is already verified')
    }
    
    if(!user.verificationToken) {
      throw new Error('Token not found')
    }
    
    await this.verifyToken(user.verificationToken, body.code);
    user.isVerified = true;
    user.verificationToken = null;
    const savedUser = await this.userRepository.save(user);
    
    await this.userContestService.initPublicContest(savedUser);
    return savedUser.toApiResponse();
  }
  
  async forgotPassword(body: { email: string }) {
    const emailToLower = body.email.toLowerCase();
    const user = await this.userRepository.findOneBy({email: emailToLower});
    if (!user) {
      throw new Error('User not found')
    }
    const {verificationCode, verificationCodeWithTime, verificationCodeExpiresInMinutes} = await this.generateToken();
    user.resetPasswordToken = verificationCodeWithTime;
    const savedUser = await this.userRepository.save(user);
    
    await this.mailService.sendResetPasswordEmail(savedUser.email, verificationCode, verificationCodeExpiresInMinutes);
    return {
      ok: true,
      message: 'Email sent'
    }
  }
  
  async resetPassword(body: { email: string, code: string, password: string }) {
    const emailToLower = body.email.toLowerCase();
    const user = await this.userRepository.findOneBy({email: emailToLower});
    if (!user) {
      throw new Error('User not found')
    }
    if(!user.resetPasswordToken) {
      throw new Error('Token not found')
    }
    await this.verifyToken(user.resetPasswordToken, body.code);
    user.password = bycrypt.hashSync(body.password, 10);
    user.resetPasswordToken = null;
    const savedUser = await this.userRepository.save(user);
    return savedUser.toApiResponse();
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