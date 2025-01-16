import { Elysia, t } from "elysia";
import { QuestionService } from "../services/QuestionService";

const questionPlugin = new Elysia()
  .group("/questions", (group) =>
    group
      .post("/", async ({ body }) => {
        return await QuestionService.getInstance().createQuestion(body);
      }, {
        detail: {
          tags: ["question"],
          summary: "Create a new question",
        },
        body: t.Object({
          questionType: t.String(),
          question: t.String(),
          grade: t.String(),
          subject: t.String(),
          difficulty_level: t.String(),
          choices: t.Optional(t.Array(
            t.Object({
              choice: t.String(),
              statement: t.Optional(t.Boolean()), 
            })
          )),
          correct_answer: t.Optional(t.String()),
          templateCode: t.Optional(t.String()), // Coding question-specific
          testCases: t.Optional(t.Array(
            t.Object({
              input: t.String(),
              output: t.String(),
            })
          )),
        }),
      })
      .get("/", async ({query}) => {
        return await QuestionService.getInstance().getAllQuestions(query);
      }, {
        detail: {
          tags: ['question'],
          summary: 'Get all questions',
        },
        query: t.Object({
          page: t.Optional(t.String({ default: "0" })),
          limit: t.Optional(t.String({ default: "10" })),
        }),
      })
      .get("/:id", async ({ params }) => {
        return await QuestionService.getInstance().getQuestionById(params.id);
      }, {
        detail: {
          tags: ["question"],
          summary: "Get question by ID",
        },
        params: t.Object({
          id: t.Number(),
        }),
      })
      .put("/:id", async ({ params, body }) => {
        return await QuestionService.getInstance().updateQuestion(params.id, body);
      }, {
        detail: {
          tags: ["question"],
          summary: "Update question by ID",
        },
        params: t.Object({
          id: t.Number(),
        }),
        body: t.Object({
          questionType: t.Optional(t.String()),
          question: t.Optional(t.String()),
          grade: t.Optional(t.String()),
          subject: t.Optional(t.String()),
          difficulty_level: t.Optional(t.String()),
          choices: t.Optional(t.Array(
            t.Object({
              choice: t.String(),
              statement: t.Optional(t.Boolean()),
            })
          )),
          correctAnswer: t.Optional(t.String()),
          templateCode: t.Optional(t.String()),
          testCases: t.Optional(t.Array(
            t.Object({
              input: t.String(),
              output: t.String(),
            })
          )),
        }),
      })
      .delete("/:id", async ({ params }) => {
        return await QuestionService.getInstance().deleteQuestion(params.id);
      }, {
        detail: {
          tags: ["question"],
          summary: "Delete question by ID",
        },
        params: t.Object({
          id: t.Number(),
        }),
      })
  );

export default questionPlugin;
