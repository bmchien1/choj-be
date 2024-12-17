import {Elysia, t} from "elysia";
import {problemService} from "../services";
import {AppRole, ProblemDifficulty} from "../types";
import isAuthenticated from "../middlewares/isAuthenticated";

const problemPlugin = new Elysia()
.group("/problem", (group) =>
	group
	.use(problemService)
	.derive(isAuthenticated())
	.get("/", async ({problemService, query, user}) => {
		return await problemService.getAll({
			...query,
			isHide: true,
		});
	}, {
		detail: {
			tags: ['Problem'],
			summary: '[USER] Get all problems',
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: '0',
			}),
			limit: t.String({
				default: '10',
			}),
			contestId: t.Optional(t.String()),
			problemName: t.Optional(t.String()),
			problemCode: t.Optional(t.String()),
			difficulty: t.Optional(t.String({
				enum: Object.values(ProblemDifficulty),
			})),
		})
	})
	.get("/:id", async ({problemService, params, user}) => {
		return await problemService.getOne({
			id: +params.id,
			isHide: true,
		});
	}, {
		detail: {
			tags: ['Problem'],
			summary: '[USER] Get one problem',
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String(),
		})
	})
	.derive(isAuthenticated([AppRole.ADMIN]))
	.get("/admin", async ({problemService, query, user}) => {
		return await problemService.getAll({
			...query,
			isHide: false,
		});
	}, {
		detail: {
			tags: ['Problem'],
			summary: '[USER] Get all problems',
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: '0',
			}),
			limit: t.String({
				default: '10',
			}),
			contestId: t.Optional(t.String()),
			problemName: t.Optional(t.String()),
			problemCode: t.Optional(t.String()),
			difficulty: t.Optional(t.String({
				enum: Object.values(ProblemDifficulty),
			})),
		})
	})
	.get("/admin/:id", async ({problemService, params, user}) => {
		return await problemService.getOne({
			id: +params.id,
			isHide: false,
		});
	}, {
		detail: {
			tags: ['Problem'],
			summary: '[ADMIN] Get one problem',
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String(),
		})
	})
	.post("/", async ({problemService, body}) => {
		return await problemService.create(body);
	}, {
		detail: {
			tags: ['Problem'],
			summary: '[ADMIN] Create a problem',
			security: [{JwtAuth: []}]
		},
		body: t.Object({
			problemName: t.String(),
			problemCode: t.String(),
			difficulty: t.String({
				enum: Object.values(ProblemDifficulty),
			}),
			maxPoint: t.Number(),
			contestId: t.Number(),
			problemStatement: t.String(),
			tags: t.Optional(t.Array(t.String())),
			testCases: t.Array(t.Object({
				input: t.String(),
				output: t.String(),
				hidden: t.Optional(t.Number({default: 0})),
			})),
			cpuTimeLimit: t.Optional(t.Number()),
			memoryLimit: t.Optional(t.Number()),
			maxTimeCommit: t.Optional(t.Number()),
		})
	})
	.put("/:id", async ({problemService, body, params}) => {
		return await problemService.update(+params.id, body);
	}, {
		detail: {
			tags: ['Problem'],
			summary: '[ADMIN] Update a problem',
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String(),
		}),
		body: t.Object({
			problemName: t.Optional(t.String()),
			problemCode: t.Optional(t.String()),
			difficulty: t.Optional(t.String({
				enum: Object.values(ProblemDifficulty),
			})),
			maxPoint: t.Optional(t.Number()),
			contestId: t.Optional(t.Number()),
			problemStatement: t.Optional(t.String()),
			tags: t.Optional(t.Array(t.String())),
			testCases: t.Optional(t.Array(t.Object({
				input: t.String(),
				output: t.String(),
				hidden: t.Optional(t.Number({default: 0})),
			}))),
			cpuTimeLimit: t.Optional(t.Number()),
			memoryLimit: t.Optional(t.Number()),
			maxTimeCommit: t.Optional(t.Number()),
		})
	})
	.delete("/:id", async ({problemService, params}) => {
		return await problemService.delete(+params.id);
	}, {
		detail: {
			tags: ['Problem'],
			summary: '[ADMIN] Delete a problem',
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String(),
		})
	})
	.delete("/soft/:id", async ({problemService, params}) => {
		return await problemService.softDelete(+params.id);
	}, {
		detail: {
			tags: ['Problem'],
			summary: '[ADMIN] Soft delete a problem',
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String(),
		})
	})
	.put("/restore/:id", async ({problemService, params}) => {
		return await problemService.restore(+params.id);
	}, {
		detail: {
			tags: ['Problem'],
			summary: '[ADMIN] Restore a problem',
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String(),
		})
	})
)

export default problemPlugin