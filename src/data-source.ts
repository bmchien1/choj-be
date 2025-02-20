import "reflect-metadata";
import { DataSource } from "typeorm";
import * as dotenv from "dotenv"; // Add dotenv import

dotenv.config(); // Load environment variables
const dbUrl = process.env.DATABASE_URL; // Check this

import { User} from "./entities/User";
import { Course} from "./entities/Course";
import { Test} from "./entities/Test";
import { Question} from "./entities/Question";
import { MultipleChoiceQuestion} from "./entities/MultipleChoiceQuestion";
import { TrueFalseQuestion} from "./entities/TrueFalseQuestion";
import { ShortAnswerQuestion} from "./entities/ShortAnswerQuestion";
import { CodingQuestion} from "./entities/CodingQuestion";
import { Lesson} from "./entities/Lesson";
import { Assignment} from "./entities/Assignment";
import { JoinCourseRequest} from "./entities/JoinCourseRequest";
import { UserInCourse} from "./entities/UserInCourse";
import { Submission} from "./entities/Submission";
import { TestCase} from "./entities/TestCase";


// import { CodingQuestion} from "./entities/CodingQuestion";


export const AppDataSource = new DataSource({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true, // Set to false in production
    logging: true, // Consider disabling this in production to avoid performance impact
    entities: [
        User,
        Course,
        Test,
        Question,
        MultipleChoiceQuestion,
        TrueFalseQuestion,
        ShortAnswerQuestion,
        CodingQuestion,Lesson,Assignment,JoinCourseRequest,UserInCourse,Submission, TestCase
    ],
    migrations: [], // Ensure the migration folder path is correct
    subscribers: [], // Include subscribers if used
});

AppDataSource.initialize()
  .then(() => console.log("Database connected"))
  .catch((err) => console.error("Database connection error:", err));
