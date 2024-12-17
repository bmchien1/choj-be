import "reflect-metadata"
import {DataSource} from "typeorm"
import {
	Contest, JoinContestRequest,
	Problem,
	ProblemTag,
	ProblemTestCase,
	Submission,
	SubmissionTestCase,
	User,
	UserContest,
	UserProblem
} from "./entities";

export const AppDataSource = new DataSource({
	//unit test can't load env
	url: process.env.DATABASE_URL,
	type: "postgres",
	synchronize: true,
	logging: false,
	entities: [
		User,
		Contest,
		Problem,
		ProblemTag,
		ProblemTestCase,
		Submission,
		UserContest,
		UserProblem,
		SubmissionTestCase,
		JoinContestRequest,
	],
	migrations: [],
	subscribers: [],
})
