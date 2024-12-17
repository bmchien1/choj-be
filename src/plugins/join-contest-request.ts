import {Elysia, t} from "elysia";
import {joinContestRequestService} from "../services";
import isAuthenticated from "../middlewares/isAuthenticated";
import {AppRole} from "../types";

const joinContestRequestPlugin = new Elysia()
.group("/join-contest-requests", (group) =>
	group
	.use(joinContestRequestService)
	.derive(isAuthenticated())
	.post("/", async ({joinContestRequestService, body, user}) => {
		return await joinContestRequestService.create(user, body)
	}, {
		detail: {
			summary: "[USER] Create join contest request",
			tags: ["Join Contest Request"],
			security: [{JwtAuth: []}]
		},
		body: t.Object({
			contestId: t.Number()
		})
	})
	.get("/me", async ({joinContestRequestService, query, user}) => {
		return await joinContestRequestService.getAll({
			...query,
			userId: user.id
		});
	}, {
		detail: {
			summary: "[USER] Get all join contest requests",
			tags: ["Join Contest Request"],
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
			status: t.Optional(t.String({
				description: "Filter by status",
				enum: ["0", "1", "2"]
			})),
			listContestIds: t.Optional(t.String({
				description: "Filter by list contest ids"
			}))
		})
	})
	.derive(isAuthenticated([AppRole.ADMIN]))
	.get("/", async ({joinContestRequestService, query}) => {
		return await joinContestRequestService.getAll(query);
	}, {
		detail: {
			summary: "[ADMIN] Get all join contest requests",
			tags: ["Join Contest Request"],
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: "0"
			}),
			limit: t.String({
				default: "10"
			}),
			email: t.Optional(t.String()),
			contestId: t.Optional(t.String()),
			status: t.Optional(t.String({
				description: "Filter by status",
				enum: ["0", "1", "2"]
			})),
			listContestIds: t.Optional(t.String({
				description: "Filter by list contest ids"
			}))
		})
	})
	.put("/approve/:id", async ({joinContestRequestService, params}) => {
		return await joinContestRequestService.approve(+params.id);
	}, {
		detail: {
			summary: "[ADMIN] Approve join contest request",
			tags: ["Join Contest Request"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String()
		})
	})
	.put("/reject/:id", async ({joinContestRequestService, params}) => {
		return await joinContestRequestService.reject(+params.id);
	}, {
		detail: {
			summary: "[ADMIN] Reject join contest request",
			tags: ["Join Contest Request"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String()
		})
	})
);

export default joinContestRequestPlugin;