import { Elysia, t } from "elysia";
import { AssignmentService } from "../services/AssignmentService";

const assignmentPlugin = new Elysia()
  .group("/assignments", (group) =>
    group
      .post("/", async ({ body }) => {
        const { courseId, ...assignmentData } = body;
        return await AssignmentService.getInstance().createAssignment(courseId, assignmentData);
      }, {
        detail: {
          tags: ['assignment'],
          summary: 'Create a new assignment',
        },
        body: t.Object({
            courseId: t.Number(),
            title: t.String(),
            description: t.String(),
            duration: t.String(),
            start_time: t.Optional(t.String()),
            end_time: t.Optional(t.String()),
            questions_scores: t.Optional(t.Any()),
          }),
      })
      .get("/course/:courseId", async ({ params }) => {
        return await AssignmentService.getInstance().getAssignmentsByCourse(params.courseId);
      }, {
        detail: {
          tags: ['assignment'],
          summary: 'Get assignments by course ID',
        },
        params: t.Object({
          courseId: t.Number(),
        }),
      })
      .get("/:id", async ({ params }) => {
        return await AssignmentService.getInstance().getAssignmentById(params.id);
      }, {
        detail: {
          tags: ['assignment'],
          summary: 'Get assignment by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
      })
      .put("/:id", async ({ params, body }) => {
        return await AssignmentService.getInstance().updateAssignment(params.id, body);
      }, {
        detail: {
          tags: ['assignment'],
          summary: 'Update assignment by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
        body: t.Object({
          title: t.Optional(t.String()),
          description: t.Optional(t.String()),
          duration: t.Optional(t.String()),
          start_time: t.Optional(t.String()),
          end_time: t.Optional(t.String()),
          questions_scores: t.Optional(t.Any()),
        }),
      })
      .delete("/:id", async ({ params }) => {
        return await AssignmentService.getInstance().deleteAssignment(params.id);
      }, {
        detail: {
          tags: ['assignment'],
          summary: 'Delete assignment by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
      })
  );

export default assignmentPlugin;
