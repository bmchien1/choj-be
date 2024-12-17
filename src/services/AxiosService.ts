import axios, {AxiosInstance} from "axios";
import * as queryString from "node:querystring";

class AxiosService {
	private static instance: AxiosService;
	private axiosClient: AxiosInstance;
	
	constructor() {
		this.axiosClient = axios.create({
			baseURL: process.env.JUDGE_SERVER_URL,
			headers: {
				'Content-Type': 'application/json'
			},
			paramsSerializer: (params) => queryString.stringify(params),
		});
		
		this.axiosClient.interceptors.response.use(
			(response) => {
				if (response && response.data) {
					return response.data;
				}
				
				return response;
			},
			(error) => {
				return Promise.reject(error.response.data);
			}
		);
	}
	
	public static getInstance() {
		if (!AxiosService.instance) {
			AxiosService.instance = new AxiosService();
		}
		return AxiosService.instance;
	}
	
	public async get(url: string, query: any = {}): Promise<any> {
		return await this.axiosClient.get(url, {params: query});
	}
	
	public async post(url: string, body: any = {}): Promise<any> {
		return await this.axiosClient.post(url, body);
	}
	
	public async put(url: string, body: any = {}): Promise<any> {
		return await this.axiosClient.put(url, body);
	}
	
	public async delete(url: string, query: any = {}): Promise<any> {
		return await this.axiosClient.delete(url, {params: query});
	}
}

export default AxiosService;