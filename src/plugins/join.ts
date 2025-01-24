import { Elysia, t } from "elysia";
import { CourseService } from "../services/CourseService";
import { JoinCourseService } from "../services/JoinCourseService";

const joinPlugin = new Elysia()
  .group("/join", (group) =>
    group
    .post("/", async ({ body }) => {
        const { userId, courseId } = body;
        console.log(body);

        // Create a request for the user to join the course
        const joinRequest = await JoinCourseService.getInstance().createJoinRequest(userId, courseId);

        return {
            message: "Join course request submitted successfully",
            joinRequest,
        };

    }, {
    detail: {
        tags: ['join'],
        summary: 'Request to join a course',
    },
    body: t.Object({
        userId: t.Numeric(),
        courseId: t.Numeric(),
        }),
    })
    .get("/:creatorId", async ({ params }) => {
        return await JoinCourseService.getInstance().getJoinCourseRequestsByCreator(params.creatorId);
    }, {
        detail: {
        tags: ['join'],
        summary: 'Get all join course requests by creator ID',
        },
        params: t.Object({
        creatorId: t.Numeric(),
        }),
    })
    .put("/:requestId", async ({ params, body }) => {
        const { action } = body as { action: "approve" | "reject" }; 
        if (!action || !['approve', 'reject'].includes(action)) {
          throw new Error("Action must be either 'approve' or 'reject'");
        }

        return await JoinCourseService.getInstance().approveOrRejectRequest(params.requestId, action);
      }, {
        detail: {
          tags: ['join'],
          summary: 'Approve or reject a join course request',
        },
        params: t.Object({
          requestId: t.Numeric(),
        }),
        body: t.Object({
          action: t.String(),
        }),
      })
      .get("/user/:userId", async ({ params }) => {
        return await JoinCourseService.getInstance().getJoinCourseRequestsByUser(params.userId);
    }, {
        detail: {
            tags: ['join'],
            summary: 'Get all join course requests by user ID',
        },
        params: t.Object({
            userId: t.Numeric(),
        }),
    })
    .get("/", async () => {
        return await JoinCourseService.getInstance().getAllJoinRequests();
      }, {
        detail: {
          tags: ['join'],
          summary: 'Get all join course requests',
        },
      })
    
  );

export default joinPlugin;
