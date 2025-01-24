import { AppDataSource } from "../data-source";
import { Submission } from "../entities/Submission";
import { Assignment } from "../entities/Assignment";
import { Question } from "../entities/Question";
import { MultipleChoiceQuestion } from "../entities/MultipleChoiceQuestion";
import { ShortAnswerQuestion } from "../entities/ShortAnswerQuestion";
import { TrueFalseQuestion } from "../entities/TrueFalseQuestion";
import { CodingQuestion } from "../entities/CodingQuestion";
import  CompilerService  from "./CompilerService";
import  RedisService  from "./RedisService";

export class SubmissionService {
    private static instance: SubmissionService;
    private submissionRepository = AppDataSource.getRepository(Submission);
    private assignmentRepository = AppDataSource.getRepository(Assignment);
    private compilerService = CompilerService.getInstance();
    private redisService = RedisService.getInstance();

    private constructor() {}

    public static getInstance(): SubmissionService {
        if (!SubmissionService.instance) {
            SubmissionService.instance = new SubmissionService();
        }
        return SubmissionService.instance;
    }

    async submitAssignment(userId: number, assignmentId: number, answers: any) {
        const assignment = await this.assignmentRepository.findOne({
            where: { id: assignmentId },
        });

        if (!assignment) {
            throw new Error("Assignment not found.");
        }
        console.log(assignment)
        let totalScore = 0;
        for (const answer of answers) {
            const question = await AppDataSource.getRepository(Question).findOne({ where: { id: answer.questionId } });
            if (!question) continue;
            const scoreObj = assignment.questions_scores.find((qs: { question_id: number; points: number }) => qs.question_id === question.id);
            const questionScore = scoreObj ? scoreObj.points : 0;
            // console.log(scoreObj);
            // console.log(question);

            switch (question.questionType) {
                case "multiple-choice":
                    totalScore += await this.evaluateMultipleChoice(answer, question.id, questionScore);
                    break;
                case "short-answer":
                    totalScore += await this.evaluateShortAnswer(answer, question.id, questionScore);
                    break;
                case "true-false":
                    totalScore += await this.evaluateTrueFalse(answer, question.id, questionScore);
                    break;
                case "coding":
                    await this.handleCodingSubmission(answer, question.id,questionScore);
                    break;
                default:
                    console.warn(`Unknown question type: ${question.questionType}`);
                    break;
            }
        }
        console.log(totalScore);
        // const newSubmission = this.submissionRepository.create({
        //     user: { id: userId },
        //     assignment: { id: assignmentId },
        //     answers: answers,
        //     score: totalScore,
        // });

        // await this.submissionRepository.save(newSubmission);
        return { message: "Submission successful", totalScore };
    }

    private async evaluateMultipleChoice(answer: any, questionId: number, questionScore: number) {
        const mcq = await AppDataSource.getRepository(MultipleChoiceQuestion).findOne({ where: { question_id: { id: questionId } } });
        // console.log(mcq);
        // console.log(answer.answer)
        // console.log(mcq?.choices[mcq.correct_answer].choice);
        return mcq && answer.answer === mcq.choices[mcq.correct_answer].choice ? questionScore : 0;
    }

    private async evaluateShortAnswer(answer: any, questionId: number, questionScore: number) {
        const saq = await AppDataSource.getRepository(ShortAnswerQuestion).findOne({ where: { question_id: { id: questionId } } });
        return saq && answer.answer.trim().toLowerCase() === saq.correct_answer.trim().toLowerCase() ? questionScore : 0;
    }

    private async evaluateTrueFalse(answer: any, questionId: number, questionScore: number) {
        const tfq = await AppDataSource.getRepository(TrueFalseQuestion).findOne({ where: { question_id: { id: questionId } } });
        return tfq && answer.answer === tfq.choice ? questionScore : 0;
    }

    private async handleCodingSubmission(answer: any, questionId: number, questionScore: number) {
        // const codingQuestion = await AppDataSource.getRepository(CodingQuestion).findOne({ where: { question_id: { id: questionId } } });
        // if (codingQuestion) {
        //     const submissionData = {
        //         sourceCode: answer.response,
        //         languageId: answer.languageId,
        //         memoryLimit: codingQuestion.memoryLimit,
        //         timeLimit: codingQuestion.cpuTimeLimit,
        //     };
        //     const submissionResponse = await this.compilerService.createSubmissionsBatch([submissionData]);
        //     const submissionToken = submissionResponse[0]?.token;
        //     if (submissionToken) {
        //         await this.redisService.addSubmissionEvent([submissionToken]);
        //     }
        // }
        const cq = await AppDataSource.getRepository(CodingQuestion).findOne({ where: { question_id: { id: questionId } } });
        return cq && answer.answer.trim().toLowerCase() === cq.template_code.trim().toLowerCase() ? questionScore : 0;
    }

    async getSubmissionsByAssignment(assignmentId: number) {
        return await this.submissionRepository.find({
            where: { assignment: { id: assignmentId } },
            relations: ["user"],
        });
    }

    async getSubmissionById(submissionId: number) {
        return await this.submissionRepository.findOne({
            where: { id: submissionId },
            relations: ["user", "assignment"],
        });
    }
}
