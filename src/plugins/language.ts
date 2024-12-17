import {Elysia, t} from "elysia";
import {compilerService} from "../services";

const languagePlugin = new Elysia()
	.group("/languages", (group) =>
		group
			.use(compilerService)
			.get("/", async ({compilerService}) => {
				return await compilerService.getLanguages();
			}, {
				detail: {
					summary: "Get all languages",
					tags: ["Language"],
				}
			})
			.get("/:id", async ({compilerService, params}) => {
				return await compilerService.getLanguageById(+params.id);
			}, {
				detail: {
					summary: "Get language by id",
					tags: ["Language"],
				},
				params: t.Object({
					id: t.String(),
				})
			})
	)

export default languagePlugin;