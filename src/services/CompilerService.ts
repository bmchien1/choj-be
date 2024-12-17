import AxiosService from "./AxiosService";
import {Language} from "../types";
import {Elysia} from "elysia";

class CompilerService {
	private static instance: CompilerService;
	private readonly axiosService: AxiosService;
	
	constructor() {
		this.axiosService = AxiosService.getInstance();
	}
	
	public static getInstance() {
		if (!CompilerService.instance) {
			CompilerService.instance = new CompilerService();
		}
		return CompilerService.instance;
	}
	
	public async getLanguages(): Promise<Language[]> {
		const listLanguages = await this.axiosService.get('/languages/all');
		
		return listLanguages.filter((lang: Language) => !lang.is_archived)
	}
	
	public async getLanguageById(id: number): Promise<Language> {
		const language = await this.axiosService.get(`/languages/${id}`);
		
		if(!language) {
			throw new Error('Language not found');
		}
		
		if (language.is_archived) {
			throw new Error('Language is archived');
		}
		
		return language;
	}
	
	public async createSubmissionsBatch(submissions: any[]) {
		return await this.axiosService.post('/submissions/batch?base64_encoded=true', {submissions},);
	}
	
	public async getSubmissionsBatch(tokens: string[]) {
		let url = '/submissions/batch?tokens=';
		url += tokens.join(',');
		url += '&base64_encoded=true';
		return await this.axiosService.get(url);
	}
}

export {CompilerService};
export default new Elysia().decorate("compilerService", CompilerService.getInstance());