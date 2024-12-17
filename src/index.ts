import {Elysia} from "elysia";
import {cors} from "@elysiajs/cors";
import {swagger} from '@elysiajs/swagger'
import {AppDataSource} from "./data-source";
import responseMiddleware from "./middlewares/responseMiddleware";
import errorMiddleware from "./middlewares/errorMiddleware";
import {jwt} from '@elysiajs/jwt'
import {
	authPlugin,
	contestPlugin, joinContestRequestPlugin, languagePlugin,
	problemPlugin,
	problemTagPlugin, statisticsPlugin, submissionPlugin,
	userContestPlugin,
	userProblemPlugin
} from "./plugins";
import InitDataService from "./services/InitDataService";
import RedisService from "./services/RedisService";

AppDataSource.initialize().then(async () => {
	console.log('Database connected to url ' + process.env.DATABASE_URL);
	//init data
	await InitDataService.getInstance().initAdminAccount();
	await InitDataService.getInstance().initPublicContest();
	RedisService.getInstance(); //init redis service
}).catch((err) => {
	console.error('Database connection error: ', err);
});
const jwtConfig: any = {
	name: 'jwt',
	//when run test the env is not loaded
	secret: process.env.JWT_SECRET,
	exp: '1y',
}
const app = new Elysia()
.use(cors())
.use(swagger(
	{
		path: '/swagger-ui',
		provider: 'swagger-ui',
		documentation: {
			info: {
				title: 'AUTO GRADER HUB BE API',
				description: 'AUTO GRADER HUB BE API Documentation',
				version: '1.0.0',
			},
			components: {
				securitySchemes: {
					JwtAuth: {
						type: 'http',
						scheme: 'bearer',
						bearerFormat: 'JWT',
						description: 'Enter JWT Bearer token **_only_**'
					}
				}
			},
		},
		swaggerOptions: {
			persistAuthorization: true,
		}
	}
))
.get("/", () => "Health check: Server's started!")
.onAfterHandle(responseMiddleware)
.onError(errorMiddleware)
.use(jwt(jwtConfig))

.group("/api", (group) =>
		group
		.use(authPlugin)
		.use(contestPlugin)
		.use(problemPlugin)
		.use(problemTagPlugin)
		.use(userContestPlugin)
		.use(userProblemPlugin)
		.use(submissionPlugin)
		.use(languagePlugin)
		.use(joinContestRequestPlugin)
		.use(statisticsPlugin)
	//add more plugins here
)
.listen(process.env.PORT || 3000);

console.log(`🦊 Elysia is running at http://${app.server?.hostname}:${app.server?.port}`);
console.log(`🚀 Swagger UI is running at http://${app.server?.hostname}:${app.server?.port}/swagger-ui`)

