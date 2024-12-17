import {Elysia, t} from "elysia";
import {contestService} from "../services";
import isAuthenticated from "../middlewares/isAuthenticated";
import {AppRole, ContestStatus} from "../types";

const contestPlugin = new Elysia()
.group("contest", (group) =>
	group
	.use(contestService)
	.derive(isAuthenticated())
	.get("/me", async ({contestService, query, user}) => {
		return await contestService.getAll({
			...query,
			userId: user.id
		});
	}, {
		detail: {
			summary: "[USER] Get all contests",
			tags: ["Contest"],
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: "0"
			}),
			limit: t.String({
				default: "10"
			}),
			isPublic: t.Optional(t.String({
				description: "Filter by public contests",
				enum: ["true", "false"]
			})),
			q: t.Optional(t.String())
		})
	})
	.get("/:id", async ({contestService, params, user}) => {
		return await contestService.getOne({
			id: +params.id,
			userId: user.id
		});
	}, {
		detail: {
			summary: "[USER] Get a contest",
			tags: ["Contest"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String()
		})
	})
	.derive(isAuthenticated([AppRole.ADMIN]))
	.get("/admin", async ({contestService, query}) => {
		return await contestService.getAll(query);
	}, {
		detail: {
			summary: "[ADMIN] Get all contests",
			tags: ["Contest"],
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: "0"
			}),
			limit: t.String({
				default: "10"
			}),
			isPublic: t.Optional(t.String({
				enum: ["true", "false"]
			})),
			q: t.Optional(t.String())
		})
	})
	.get("/admin/:id", async ({contestService, params, user}) => {
		return await contestService.getOne({
			id: +params.id,
		});
	}, {
		detail: {
			summary: "[ADMIN] Get a contest",
			tags: ["Contest"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String()
		})
	})
	.post("/", async ({contestService, body}) => {
		return await contestService.create(body);
	}, {
		detail: {
			summary: "[ADMIN] Create a contest",
			tags: ["Contest"],
			security: [{JwtAuth: []}]
		},
		body: t.Object({
			contestName: t.String(),
			creator: t.String(),
			description: t.Optional(t.String({
				default: ""
			})),
			isPublic: t.Optional(t.Boolean({
				default: false
			}))
		})
	})
	.put("/:id", async ({contestService, params, body}) => {
		return await contestService.update(+params.id, body);
	}, {
		detail: {
			summary: "[ADMIN] Update a contest",
			tags: ["Contest"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String()
		}),
		body: t.Object({
			contestName: t.Optional(t.String()),
			creator: t.Optional(t.String()),
			description: t.Optional(t.String()),
			status: t.Optional(t.String({
				enum: Object.values(ContestStatus)
			}))
		})
	})
	.delete("/:id", async ({contestService, params}) => {
		return await contestService.delete(+params.id);
	}, {
		detail: {
			summary: "[ADMIN] Delete a contest",
			tags: ["Contest"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String()
		})
	})
	.delete("/soft/:id", async ({contestService, params}) => {
		return await contestService.softDelete(+params.id);
	}, {
		detail: {
			summary: "[ADMIN] Soft delete a contest",
			tags: ["Contest"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String()
		})
	})
	.put("/restore/:id", async ({contestService, params}) => {
		return await contestService.restore(+params.id);
	}, {
		detail: {
			summary: "[ADMIN] Restore a contest",
			tags: ["Contest"],
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String()
		})
	})
)

export default contestPlugin