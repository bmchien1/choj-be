import { Elysia, t } from "elysia";
import { LessonService } from "../services/LessonService";

const lessonPlugin = new Elysia()
  .group("/lessons", (group) =>
    group
      .post("/", async ({ body }) => {
        const { courseId, ...lessonData } = body;
        return await LessonService.getInstance().createLesson(courseId, lessonData);
      }, {
        detail: {
          tags: ['lesson'],
          summary: 'Create a new lesson',
        },
        body: t.Object({
          courseId: t.Number(),
          title: t.String(),
          description: t.String(),
          file_url: t.Optional(t.String()),
        }),
      })
      .get("/course/:courseId", async ({ params }) => {
        return await LessonService.getInstance().getLessonsByCourse(params.courseId);
      }, {
        detail: {
          tags: ['lesson'],
          summary: 'Get lessons by course ID',
        },
        params: t.Object({
          courseId: t.Number(),
        }),
      })
      .get("/:id", async ({ params }) => {
        return await LessonService.getInstance().getLessonById(params.id);
      }, {
        detail: {
          tags: ['lesson'],
          summary: 'Get lesson by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
      })
      .put("/:id", async ({ params, body }) => {
        return await LessonService.getInstance().updateLesson(params.id, body);
      }, {
        detail: {
          tags: ['lesson'],
          summary: 'Update lesson by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
        body: t.Object({
          title: t.Optional(t.String()),
          description: t.Optional(t.String()),
          file_url: t.Optional(t.String()),
        }),
      })
      .delete("/:id", async ({ params }) => {
        return await LessonService.getInstance().deleteLesson(params.id);
      }, {
        detail: {
          tags: ['lesson'],
          summary: 'Delete lesson by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
      })
  );

export default lessonPlugin;
