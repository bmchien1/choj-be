import {Elysia, t} from "elysia";
import {userProblemService} from "../services";
import isAuthenticated from "../middlewares/isAuthenticated";
import {AppRole} from "../types";

const userProblemPlugin = new Elysia()
.group('user-problem', (group) =>
	group
	.use(userProblemService)
	.derive(isAuthenticated())
	.get('/me', async ({userProblemService, query, user}) => {
		return await userProblemService.getAll({
			...query,
			userId: user.id,
			isHide: true
		});
	}, {
		detail: {
			summary: '[USER] Get all user problems of me',
			tags: ['UserProblem'],
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: '0'
			}),
			limit: t.String({
				default: '10'
			}),
			contestId: t.Optional(t.String()),
		})
	})
	.get("/me/:problemId", async ({userProblemService, params, user}) => {
		return await userProblemService.getOne({
			userId: user.id,
			problemId: +params.problemId,
			isHide: true
		});
	}, {
		detail: {
			summary: '[USER] Get user problem by problem id',
			tags: ['UserProblem'],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			problemId: t.String()
		})
	})
	.derive(isAuthenticated([AppRole.ADMIN]))
	.get('/', async ({userProblemService, query}) => {
		return await userProblemService.getAll(query);
	}, {
		detail: {
			summary: '[ADMIN] Get all user problems',
			tags: ['UserProblem'],
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: '0'
			}),
			limit: t.String({
				default: '10'
			}),
			userId: t.Optional(t.String()),
			contestId: t.Optional(t.String()),
		})
	})
)

export default userProblemPlugin;