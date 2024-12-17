import {Elysia} from "elysia";
import statisticsService from "../services/StatisticsService";

const statisticsPlugin = new Elysia()
.group("/statistics", (group) =>
	group
	.use(statisticsService)
	.get("/", async ({statisticsService}) => {
		return await statisticsService.getStatistics();
	}, {
		detail: {
			summary: "Get statistics",
			tags: ["Statistics"],
		}
	})
	.get("/top-users", async ({statisticsService, query}) => {
		return await statisticsService.getTopUsers(query);
	}, {
		detail: {
			summary: "Get top users",
			tags: ["Statistics"],
		}
	})
	.get("/recent-contests", async ({statisticsService, query}) => {
		return await statisticsService.getRecentContests(query);
	}, {
		detail: {
			summary: "Get recent contests",
			tags: ["Statistics"],
		}
	})
	.get("/recent-problems", async ({statisticsService, query}) => {
		return await statisticsService.getRecentProblem(query);
	}, {
		detail: {
			summary: "Get recent problems",
			tags: ["Statistics"],
		}
	})
)

export default statisticsPlugin;