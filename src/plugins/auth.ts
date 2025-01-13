import {Elysia, t} from 'elysia'
import {userService} from "../services";
import isAuthenticated from "../middlewares/isAuthenticated";
import {AppRole} from "../types";

const authPlugin = new Elysia()
.group("/auth", (group) =>
	group
	.use(userService)
	.post("/register", async ({userService, body}) => {
		return await userService.register(body)
	}, {
		detail: {
			tags: ['auth'],
			summary: 'Register new user'
		},
		body: t.Object({
			email: t.String(),
			password: t.String(),
		})
	})
	.post("/login", async ({userService, body, jwt}: any) => {
		return await userService.login(body, jwt);
	}, {
		detail: {
			tags: ['auth'],
			summary: 'Login',
		},
		body: t.Object({
			email: t.String(),
			password: t.String()
		})
	})
	.derive(isAuthenticated())
	.post("/change-password", async ({userService, body, user}) => {
		return await userService.changePassword(user, body)
	}, {
		detail: {
			tags: ['auth'],
			summary: 'Change password',
			security: [
				{JwtAuth: []}
			],
		},
		body: t.Object({
			oldPassword: t.String(),
			newPassword: t.String()
		})
	})
	.get("/me", async ({user}) => {
		return user.toApiResponse()
	}, {
		detail: {
			tags: ['auth'],
			summary: 'Get me',
			security: [
				{JwtAuth: []}
			],
		}
	})
	.derive(isAuthenticated([AppRole.ADMIN]))
	.get("/users", async ({userService, query}) => {
		return await userService.getAll(query)
	}, {
		detail: {
			tags: ['auth'],
			summary: '[ADMIN] Get all users',
			security: [
				{JwtAuth: []}
			],
		},
		query: t.Object({
			page: t.String({
				default: "0"
			}),
			limit: t.String({
				default: "10"
			}),
			email: t.Optional(t.String()),
			isVerified: t.Optional(t.String({
				enum: ["true", "false"]
			})),
			role: t.Optional(t.String({
				enum: Object.values(AppRole)
			}))
		})
	})
	.get("/user/:id", async ({userService, params}) => {
		return await userService.getOne({id: params.id})
	}, {
		detail: {
			tags: ['auth'],
			summary: '[ADMIN] Get user by id',
			security: [
				{JwtAuth: []}
			],
		},
		params: t.Object({
			id: t.Number()
		})
	})
	.put("/update-user", async ({userService, body, user}) => {
		return await userService.updateAdmin(body)
	}, {
		detail: {
			tags: ['auth'],
			summary: '[ADMIN] Update user',
			security: [
				{JwtAuth: []}
			],
		},
		body: t.Object({
			userId: t.Number(),
			role: t.Optional(t.String({
				enum: Object.values(AppRole),
			}))
		})
	})
)

export default authPlugin