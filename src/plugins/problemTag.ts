import {Elysia, t} from "elysia";
import {problemTagService} from "../services";
import isAuthenticated from "../middlewares/isAuthenticated";
import {AppRole} from "../types";

const problemTagPlugin = new Elysia()
.group("/problem-tag", (group) =>
	group
	.use(problemTagService)
	.derive(isAuthenticated())
	.get("/", async ({problemTagService, query}) => {
		return await problemTagService.getAll(query);
	}, {
		detail: {
			tags: ['Problem Tag'],
			summary: '[USER] Get all problem tags',
			security: [{JwtAuth: []}]
		},
		query: t.Object({
			page: t.String({
				default: '0',
			}),
			limit: t.String({
				default: '10',
			}),
		})
	})
	.get("/:id", async ({problemTagService, params}) => {
		return await problemTagService.getOne({
			id: +params.id,
		});
	}, {
		detail: {
			tags: ['Problem Tag'],
			summary: '[USER] Get one problem tag',
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String(),
		})
	})
	.derive(isAuthenticated([AppRole.ADMIN]))
	.post("/", async ({problemTagService, body}) => {
		return await problemTagService.create(body);
	}, {
		detail: {
			tags: ['Problem Tag'],
			summary: '[ADMIN] Create a problem tag',
			security: [{JwtAuth: []}]
		},
		body: t.Object({
			tagName: t.String(),
		})
	})
	
	.put("/:id", async ({problemTagService, params, body}) => {
		return await problemTagService.update(+params.id, body);
	}, {
		detail: {
			tags: ['Problem Tag'],
			summary: '[ADMIN] Update a problem tag',
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String(),
		}),
		body: t.Object({
			tagName: t.Optional(t.String()),
		})
	})
	
	.delete("/:id", async ({problemTagService, params}) => {
		return await problemTagService.delete(+params.id);
	}, {
		detail: {
			tags: ['Problem Tag'],
			summary: '[ADMIN] Delete a problem tag',
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String(),
		})
	})
	.delete("/soft/:id", async ({problemTagService, params}) => {
		return await problemTagService.softDelete(+params.id);
	}, {
		detail: {
			tags: ['Problem Tag'],
			summary: '[ADMIN] Soft delete problem tags',
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String(),
		})
	})
	.put("/restore/:id", async ({problemTagService, params}) => {
		return await problemTagService.restore(+params.id);
	}, {
		detail: {
			tags: ['Problem Tag'],
			summary: '[ADMIN] Restore problem tags',
			security: [{JwtAuth: []}]
		},
		params: t.Object({
			id: t.String(),
		})
	})
)

export default problemTagPlugin;