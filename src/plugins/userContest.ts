import {Elysia, t} from "elysia";
import {userContestService} from "../services";
import isAuthenticated from "../middlewares/isAuthenticated";
import {AppRole} from "../types";

const userContestPlugin = new Elysia()
.group("/user-contest", (group) =>
	group
	.use(userContestService)
	.derive(isAuthenticated())
	.get("/me", async ({userContestService, query, user}) => {
		return await userContestService.getAll({
			...query,
			userId: user.id
		});
	}, {
		detail: {
			tags: ['UserContest'],
			summary: '[USER] Get all user contests of me',
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: '0',
			}),
			limit: t.String({
				default: '10',
			}),
			isPublic: t.Optional(t.String({
				enum: ['true', 'false']
			})),
			q: t.Optional(t.String()),
		})
	})
	.derive(isAuthenticated([AppRole.ADMIN]))
	.get("/", async ({userContestService, query}) => {
		return await userContestService.getAll(query);
	}, {
		detail: {
			tags: ['UserContest'],
			summary: '[ADMIN] Get all user contests',
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: '0',
			}),
			limit: t.String({
				default: '10',
			}),
			userId: t.Optional(t.String()),
			contestId: t.Optional(t.String()),
			isPublic: t.Optional(t.String({
				enum: ['true', 'false']
			})),
			q: t.Optional(t.String()),
		})
	})
	.post("/", async ({userContestService, body}) => {
		return await userContestService.createMany(body);
	}, {
		detail: {
			tags: ['UserContest'],
			summary: '[ADMIN] Create user contests',
			security: [{JwtAuth: []}]
		},
		body: t.Object({
			email: t.String(),
			contestIds: t.Array(t.Number())
		})
	})
)

export default userContestPlugin;