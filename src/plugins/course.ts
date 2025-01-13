import { Elysia, t } from "elysia";
import { CourseService } from "../services/CourseService";

const coursePlugin = new Elysia()
  .group("/courses", (group) =>
    group
      .post("/", async ({ body }) => {
        return await CourseService.getInstance().createCourse(body);
      }, {
        detail: {
          tags: ['course'],
          summary: 'Create a new course',
        },
        body: t.Object({
          name: t.String(),
          description: t.String(),
          class: t.String(),
        //   image_url: t.Optional(t.String()),
        //   subject: t.Optional(t.String({ default: 'Toán' })),
        //   start_time: t.Optional(t.String()),
        //   end_time: t.Optional(t.String()),
        }),
      })
    //   .get("/by-user", async ({ query }) => {
    //     const { email } = query;
    //     return await CourseService.getInstance().getCoursesByUser({ email });
    //   }, {
    //     detail: {
    //       tags: ['course'],
    //       summary: 'Get courses by user identifier (email or username)',
    //     },
    //     query: t.Object({
    //       email: t.Optional(t.String()),
    //     }),
    //   })
      .get("/", async ({ query }) => {
        return await CourseService.getInstance().getAllCourses(query);
      }, {
        detail: {
          tags: ['course'],
          summary: 'Get all courses',
        },
        query: t.Object({
          page: t.Optional(t.String({ default: "0" })),
          limit: t.Optional(t.String({ default: "10" })),
        }),
      })
      .get("/:id", async ({ params }) => {
        return await CourseService.getInstance().getCourseById(params.id);
      }, {
        detail: {
          tags: ['course'],
          summary: 'Get course by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
      })
      .put("/:id", async ({ params, body }) => {
        return await CourseService.getInstance().updateCourse(params.id, body);
      }, {
        detail: {
          tags: ['course'],
          summary: 'Update course by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
        body: t.Object({
          name: t.Optional(t.String()),
          description: t.Optional(t.String()),
          class: t.Optional(t.String()),
          image_url: t.Optional(t.String()),
          subject: t.Optional(t.String()),
          start_time: t.Optional(t.String()),
          end_time: t.Optional(t.String()),
        }),
      })
      .delete("/:id", async ({ params }) => {
        return await CourseService.getInstance().deleteCourse(params.id);
      }, {
        detail: {
          tags: ['course'],
          summary: 'Delete course by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
      })
  );

export default coursePlugin;
