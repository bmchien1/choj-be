import AxiosService from "./AxiosService";

class CompilerService {
    private static instance: CompilerService;
    private readonly axiosService: AxiosService;

    private constructor() {
        this.axiosService = AxiosService.getInstance();
    }

    public static getInstance(): CompilerService {
        if (!CompilerService.instance) {
            CompilerService.instance = new CompilerService();
        }
        return CompilerService.instance;
    }

    public async getLanguages() {
        const languages = await this.axiosService.get('/languages/all');
        return languages.filter((lang: any) => !lang.is_archived);
    }

    public async createSubmissionsBatch(submissions: any[]) {
        return await this.axiosService.post('/submissions/batch?base64_encoded=true', { submissions });
    }

    public async getSubmissionsBatch(tokens: string[]) {
        return await this.axiosService.get(`/submissions/batch?tokens=${tokens.join(',')}&base64_encoded=true`);
    }
}
export default CompilerService;
