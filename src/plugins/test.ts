import { Elysia, t } from "elysia";
import { TestService } from "../services/TestService";

const testPlugin = new Elysia()
  .group("/contest", (group) =>
    group
      .post("/", async ({ body }) => {
        const {  ...testData } = body;
        return await TestService.getInstance().createTest( testData);
      }, {
        detail: {
          tags: ['test'],
          summary: 'Create a new test',
        },
        body: t.Object({
          test_name: t.String(),
          description: t.String(),
          grade: t.String(),
          // duration: t.String(),
          // start_time: t.Optional(t.String()),
          // end_time: t.Optional(t.String()),
          // questions_scores: t.Any(),
        }),
      })
      .get("/", async ({ query }) => {
        return await TestService.getInstance().getAllTests(query);
      }, {
        detail: {
          tags: ['test'],
          summary: 'Get all tests',
        },
        query: t.Object({
          page: t.Optional(t.String({ default: "0" })),
          limit: t.Optional(t.String({ default: "10" })),
          userId: t.Optional(t.String()),
        }),
      })
      .get("/:id", async ({ params }) => {
        return await TestService.getInstance().getTestById(params.id);
      }, {
        detail: {
          tags: ['test'],
          summary: 'Get test by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
      })
      .put("/:id", async ({ params, body }) => {
        return await TestService.getInstance().updateTest(params.id, body);
      }, {
        detail: {
          tags: ['test'],
          summary: 'Update test by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
        body: t.Object({
          test_name: t.Optional(t.String()),
          description: t.Optional(t.String()),
          grade: t.Optional(t.String()),
          duration: t.Optional(t.String()),
          start_time: t.Optional(t.String()),
          end_time: t.Optional(t.String()),
          questions_scores: t.Optional(t.Any()),
        }),
      })
      .delete("/:id", async ({ params }) => {
        return await TestService.getInstance().deleteTest(params.id);
      }, {
        detail: {
          tags: ['test'],
          summary: 'Delete test by ID',
        },
        params: t.Object({
          id: t.Number(),
        }),
      })
  );

export default testPlugin;
