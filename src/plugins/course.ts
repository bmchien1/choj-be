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
          subject: t.String(),
          creatorId: t.Numeric(),
        }),
      })
      .post("/:id/lessons", async ({ params, body }) => {
        console.log(body);
        return await CourseService.getInstance().createLesson(params.id, body);
      }, {
        detail: {
          tags: ['course'],
          summary: 'Add a lesson to a course',
        },
        params: t.Object({
          id: t.Numeric(),
        }),
        body: t.Object({
          title: t.String(),
          description: t.String(),
          // file_url: t.Optional(t.String()),
        }),
      })
      .get("/by-user/:id", async ({ params }) => {
        // console.log(body);
        return await CourseService.getInstance().getCoursesByUserId(params.id);
      }, {
        detail: {
          tags: ['course'],
          summary: 'Get courses by user',
        },
        params: t.Object({
          id: t.Numeric(),
        }),
      })

      .get("/:id/lessons", async ({ params }) => {
        return await CourseService.getInstance().getLessonsByCourse(params.id);
      }, {
        detail: {
          tags: ['lesson'],
          summary: 'Get all lessons in a course by course ID',
        },
        params: t.Object({
          id: t.Numeric(),
        }),
      })

      .get("/lessons/:lessonId", async ({ params }) => {
        return await CourseService.getInstance().getLessonById(params.lessonId);
      }, {
        detail: {
          tags: ['lesson'],
          summary: 'Get lesson by ID',
        },
        params: t.Object({
          lessonId: t.Numeric(),
        }),
      })

      .get("/:id/assignments", async ({ params }) => {
        return await CourseService.getInstance().getAssignmentsByCourse(params.id);
      }, {
        detail: {
          tags: ['assignment'],
          summary: 'Get all assignments in a course by course ID',
        },
        params: t.Object({
          id: t.Numeric(),
        }),
      })
  
      // Get assignment by ID
      .get("/assignments/:assignmentId", async ({ params }) => {
        return await CourseService.getInstance().getAssignmentById(params.assignmentId);
      }, {
        detail: {
          tags: ['assignment'],
          summary: 'Get assignment by ID',
        },
        params: t.Object({
          assignmentId: t.Numeric(),
        }),
      })

      .post("/:id/assignments", async ({ params, body }) => {
        const courseId = params.id;
        const { title, description, total_points, matrix   } = body;
        // console.log(body);
      
        // Validate input
        if (!matrix || Object.keys(matrix).length === 0) {
          throw new Error("Matrix is required for question generation");
        }
      
        if (!total_points || total_points <= 0) {
          throw new Error("Total points must be a positive Numeric");
        }
      
        // Generate assignment with the provided matrix
        const assignmentData = {
          title,
          description,
          course_id: courseId,
        };
      
        // Generate questions based on the matrix and total points
        const savedAssignment = await CourseService.getInstance().createAssignmentWithMatrix(
          assignmentData,
          matrix,
          total_points
        );
    
        return savedAssignment;
      },
      {
        detail: {
          tags: ['course'],
          summary: 'Add an assignment to a course with generated questions',
        },
        params: t.Object({
          id: t.Numeric(),
        }),
        body: t.Object({
          title: t.String(),
          description: t.String(),
          total_points: t.Numeric(),  // Total points for the assignment
          matrix: t.Array(t.Object({
            questionType: t.String(),
            grade: t.String(),
            subject: t.String(),
            difficulty_level: t.String(),
            number_of_questions: t.Numeric(),
            percent_points: t.Numeric(),
          })),        
        }),
      })
      
      .get("/by-creator/:creatorId", async ({ params }) => {
        return await CourseService.getInstance().getCoursesByCreator(params.creatorId);
      }, {
        detail: {
          tags: ['course'],
          summary: 'Get courses by creator ID',
        },
        params: t.Object({
          creatorId: t.Numeric(),
        }),
      })
      
      // Get course details with lessons and assignments
      .get("/:id/details", async ({ params }) => {
        return await CourseService.getInstance().getCourseByIdWithDetails(params.id);
      }, {
        detail: {
          tags: ['course'],
          summary: 'Get course by ID with lessons and assignments',
        },
        params: t.Object({
          id: t.Numeric(),
        }),
      })
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
      .put("/:id", async ({ params, body }) => {
        return await CourseService.getInstance().updateCourse(params.id, body);
      }, {
        detail: {
          tags: ['course'],
          summary: 'Update course by ID',
        },
        params: t.Object({
          id: t.Numeric(),
        }),
        body: t.Object({
          name: t.Optional(t.String()),
          description: t.Optional(t.String()),
          class: t.Optional(t.String()),
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
          id: t.Numeric(),
        }),
      })
      .put("/lessons/:lessonId", async ({ params, body }) => {
        console.log(params)
        console.log(body)

        return await CourseService.getInstance().updateLesson(params.lessonId, body);
      }, {
        detail: {
          tags: ['lesson'],
          summary: 'Update lesson by ID',
        },
        params: t.Object({
          lessonId: t.Numeric(),
        }),
        body: t.Object({
          title: t.Optional(t.String()),
          description: t.Optional(t.String()),
          file_url: t.Optional(t.String()),
        }),
      })
      .delete("/lessons/:lessonId", async ({ params }) => {
        return await CourseService.getInstance().deleteLesson(params.lessonId);
      }, {
        detail: {
          tags: ['lesson'],
          summary: 'Delete lesson by ID',
        },
        params: t.Object({
          lessonId: t.Numeric(),
        }),
      })
      .put("/assignments/:assignmentId", async ({ params, body }) => {
        return await CourseService.getInstance().updateAssignment(params.assignmentId, body);
      }, {
        detail: {
          tags: ['assignment'],
          summary: 'Update assignment by ID',
        },
        params: t.Object({
          assignmentId: t.Numeric(),
        }),
        body: t.Object({
          title: t.Optional(t.String()),
          description: t.Optional(t.String()),
          questions_scores: t.Optional(t.Any()),
        }),
      })
      .delete("/assignments/:assignmentId", async ({ params }) => {
        return await CourseService.getInstance().deleteAssignment(params.assignmentId);
      }, {
        detail: {
          tags: ['assignment'],
          summary: 'Delete assignment by ID',
        },
        params: t.Object({
          assignmentId: t.Numeric(),
        }),
      })
  );

export default coursePlugin;
