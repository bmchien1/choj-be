import {Transporter} from "nodemailer";
import nodemailer from "nodemailer";
import * as handlebars from "handlebars";

class MailService {
	private readonly emailTransporter: Transporter;
	private static instance: MailService;
	
	constructor() {
		this.emailTransporter = nodemailer.createTransport({
			host: process.env.MAIL_HOST,
			port: Number(process.env.MAIL_PORT ?? 587),
			auth: {
				user: process.env.MAIL_USER,
				pass: process.env.MAIL_PASS,
			},
		});
	}
	
	public static getInstance() {
		if (!this.instance) {
			this.instance = new MailService()
		}
		return this.instance
	}
	
	async sendResetPasswordEmail(email: string, resetPassword: string, verificationCodeExpiresInMinutes: number) {
		await this.emailTransporter.verify()
		const templateFile = Bun.file('./src/mail-templates/reset-password.html')
		const template = await templateFile.text()
		const compiledTemplate = handlebars.compile(template);
		const htmlToSend = compiledTemplate({
			password: resetPassword, // Replace with your actual OTP
			email: email, // Replace with the actual username
			link: `${process.env.FRONTEND_URL}/reset-password?email=${email}`,
			time: verificationCodeExpiresInMinutes
		});
		return await this.emailTransporter.sendMail({
			from: 'binhtruong9422@gmail.com',
			to: email,
			subject: "Reset Password Confirmation",
			html: htmlToSend,
		});
	}
	
	async sendEmailVerification(email: string, verificationCode: string, verificationCodeExpiresInMinutes: number) {
		await this.emailTransporter.verify()
		const templateFile = Bun.file('./src/mail-templates/email-verification.html')
		const template = await templateFile.text()
		const compiledTemplate = handlebars.compile(template);
		
		const htmlToSend = compiledTemplate({
			code: verificationCode,// Replace with your actual link
			email: email, // Replace with the actual email
			time: verificationCodeExpiresInMinutes,
			link: `${process.env.FRONTEND_URL}/verify-email?email=${email}`
		});
		return await this.emailTransporter.sendMail({
			from: 'binhtruong9422@gmail.com',
			to: email,
			subject: "Email Verification",
			html: htmlToSend,
		});
	}
}

export default MailService