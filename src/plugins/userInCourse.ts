import { Elysia, t } from "elysia";
import { UserInCourseService } from "../services/UserInCourseService";

const userInCoursePlugin = new Elysia()
  .group("/user-in-course", (group) =>
    group
      // Get all UserInCourse records by userId
      .get("/:userId", async ({ params }) => {
        const userId = params.userId;
        return await UserInCourseService.getInstance().getAllUserInCourseByUserId(userId);
      }, {
        detail: {
          tags: ['user-in-course'],
          summary: 'Get all UserInCourse records by userId',
        },
        params: t.Object({
          userId: t.Numeric(),  // userId parameter
        }),
      })
  );

export default userInCoursePlugin;
