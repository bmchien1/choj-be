import {Elysia, t} from "elysia";
import {submissionService} from "../services";
import isAuthenticated from "../middlewares/isAuthenticated";
import {AppRole} from "../types";

const submissionPlugin = new Elysia()
.group("/submissions", (group) =>
	group
	.use(submissionService)
	.derive(isAuthenticated())
	.get("/me", async ({submissionService, query, user}) => {
		return await submissionService.getAll({
			...query,
			userId: user.id,
			isHide: true
		});
	}, {
		detail: {
			summary: "[USER] Get all user submissions",
			tags: ["Submission"],
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: "0"
			}),
			limit: t.String({
				default: "10"
			}),
			contestId: t.Optional(t.String()),
			problemId: t.Optional(t.String()),
			submissionHash: t.Optional(t.String()),
		})
	})
	.get("/get-by-id/:id", async ({submissionService, params, user}) => {
		return await submissionService.getOne({
			id: +params.id,
			userId: user.id,
			isHide: true
		});
	}, {
		detail: {
			summary: "[USER] Get submission by id",
			tags: ["Submission"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String()
		})
	})
	.get("/get-by-hash/:hash", async ({submissionService, params, user}) => {
		return await submissionService.getOne({submissionHash: params.hash, isHide: true, userId: user.id});
	}, {
		detail: {
			summary: "[USER] Get submission by hash",
			tags: ["Submission"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			hash: t.String()
		})
	})
	.post("/", async ({submissionService, body, user}) => {
		return await submissionService.create(user, body);
	}, {
		detail: {
			summary: "[USER] Create submission",
			tags: ["Submission"],
			security: [{JwtAuth: []}]
		},
		body: t.Object({
			problemId: t.Number(),
			contestId: t.Number(),
			languageId: t.Number(),
			sourceCode: t.String()
		})
	})
	.derive(isAuthenticated([AppRole.ADMIN]))
	.get("/admin", async ({submissionService, query}) => {
		return await submissionService.getAll({
			...query,
			isHide: false
		});
	}, {
		detail: {
			summary: "[ADMIN] Get all submissions",
			tags: ["Submission"],
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: "0"
			}),
			limit: t.String({
				default: "10"
			}),
			contestId: t.Optional(t.String()),
			problemId: t.Optional(t.String()),
			submissionHash: t.Optional(t.String()),
			userId: t.Optional(t.String()),
			userEmail: t.Optional(t.String()),
		})
	})
	.get("/admin/:id", async ({submissionService, params}) => {
		return await submissionService.getOne({
			id: +params.id,
			isHide: false
		});
	}, {
		detail: {
			summary: "[ADMIN] Get submission by id",
			tags: ["Submission"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String()
		})
	})
	.get("/admin/get-by-hash/:hash", async ({submissionService, params}) => {
		return await submissionService.getOne({submissionHash: params.hash, isHide: false});
	}, {
		detail: {
			summary: "[ADMIN] Get submission by hash",
			tags: ["Submission"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			hash: t.String()
		})
	})
)

export default submissionPlugin;