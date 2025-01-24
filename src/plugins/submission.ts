import { Elysia, t } from "elysia";
import { SubmissionService } from "../services/SubmissionService";

const submissionPlugin = new Elysia()
  .group("/submissions", (group) =>
    group
      .post("/", async ({ body }) => {
        const { userId, assignmentId, answers } = body;
        return await SubmissionService.getInstance().submitAssignment(userId, assignmentId, answers);
      }, {
        detail: {
          tags: ["submission"],
          summary: "Submit assignment",
        },
        body: t.Object({
          userId: t.Numeric(),
          assignmentId: t.Numeric(),
          answers: t.Array(t.Object({
            questionId: t.Numeric(),
            answer: t.Any(),
          })),
        }),
      })

      .get("/assignment/:assignmentId", async ({ params }) => {
        return await SubmissionService.getInstance().getSubmissionsByAssignment(params.assignmentId);
      }, {
        detail: {
          tags: ["submission"],
          summary: "Get submissions for an assignment",
        },
        params: t.Object({
          assignmentId: t.Numeric(),
        }),
      })

      .get("/:submissionId", async ({ params }) => {
        return await SubmissionService.getInstance().getSubmissionById(params.submissionId);
      }, {
        detail: {
          tags: ["submission"],
          summary: "Get submission by ID",
        },
        params: t.Object({
          submissionId: t.Numeric(),
        }),
      })
  );

export default submissionPlugin;
