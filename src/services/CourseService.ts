import {Repository} from "typeorm";
import {Course} from "../entities/Course";
import { User } from "../entities/User";
import {AppDataSource} from "../data-source";
import { Lesson } from "../entities/Lesson";
import { Assignment } from "../entities/Assignment";
import { Question } from "../entities/Question";
import { UserInCourse } from "../entities/UserInCourse";

class CourseService {
  private readonly courseRepository: Repository<Course>;
  private readonly userRepository: Repository<User>;
  private readonly lessonRepository: Repository<Lesson>;
  private readonly assignmentRepository: Repository<Assignment>;
  private readonly questionRepository: Repository<Question>;
  private readonly userInCourseRepository: Repository<UserInCourse>; // Add this line
  
  private static instance: CourseService;

  constructor() {
    this.courseRepository = AppDataSource.getRepository(Course);
    this.userRepository = AppDataSource.getRepository(User);
    this.lessonRepository = AppDataSource.getRepository(Lesson);
    this.assignmentRepository = AppDataSource.getRepository(Assignment);
    this.questionRepository = AppDataSource.getRepository(Question);
    this.userInCourseRepository = AppDataSource.getRepository(UserInCourse);

  }

  public static getInstance() {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }


  async getCoursesByUserId(userId: number) {
    const userInCourses = await this.userInCourseRepository.find({
      where: { user: { id: userId } },
      relations: ["course"], // Fetch related courses
    });

    if (!userInCourses.length) {
      throw new Error("No courses found for this user");
    }

    // Return only the course entities, not the UserInCourse wrapper
    return userInCourses.map((userInCourse) => userInCourse.course);
  }

  async createCourse(body: { name: string; description: string; class: string; subject: string; creatorId: number }) {
    const user = await this.userRepository.findOneBy({ id: body.creatorId });
    if (!user) {
      throw new Error("Creator user not found");
    }

    const course = new Course();
    course.name = body.name;
    course.description = body.description;
    course.class = body.class;
    course.subject = body.subject;
    course.creator = user;

    return await this.courseRepository.save(course);
  }

  async createLesson(courseId: number, body: { title: string; description: string; file_url?: string }) {
      const course = await this.courseRepository.findOneBy({ id: courseId });
      if (!course) throw new Error("Course not found");
      const lesson = this.lessonRepository.create({ ...body, course });

      return await this.lessonRepository.save(lesson);
  }

  async getLessonsByCourse(courseId: number) {
      const lessons = await this.lessonRepository.find({
        where: { course: { id: courseId } },
        relations: ["course"], // Include course details if needed
      });

      if (!lessons.length) {
        throw new Error("No lessons found for the given course ID.");
      }

      return lessons;

  }

  // Get a single lesson by ID
  async getLessonById(lessonId: number) {
      const lesson = await this.lessonRepository.findOne({
        where: { id: lessonId },
        relations: ["course"], // Include course details if needed
      });

      if (!lesson) {
        throw new Error("Lesson not found.");
      }

      return lesson;

  }

  async createAssignmentWithMatrix(assignmentData: any, matrix: QuestionMatrix[], totalPoints: number) {
    if (!matrix || matrix.length === 0) {
      throw new Error("Matrix is required for question generation");
    }
    const course = await this.courseRepository.findOneBy({ id: assignmentData.course_id });

    const { generatedQuestions, questionScores } = await this.generateQuestionsFromMatrix(matrix, totalPoints);

    const assignment = {
      title: assignmentData.title,
      description: assignmentData.description,
      course: course,
      questions: generatedQuestions.map((q) => q.id), // Store only question IDs
      questions_scores: questionScores, // Store points for each question
      total_points: totalPoints,
    };
  
    // Save the assignment with the question scores
    const savedAssignment = await this.assignmentRepository.save(assignment);
    // console.log(savedAssignment);
    return savedAssignment;
  }

  private async generateQuestionsFromMatrix(matrix: QuestionMatrix[], totalPoints: number) {
    let generatedQuestions: any[] = [];
    let totalQuestionsCount = 0;
  
    // Count total number of questions
    for (const criteria of matrix) {
      totalQuestionsCount += criteria.number_of_questions;
    }
  
    // Check if the total points is a positive number
    if (totalPoints <= 0 || totalQuestionsCount <= 0) {
      throw new Error("Invalid total points or question count.");
    }
  
    let pointsPerQuestion = totalPoints / totalQuestionsCount;
  
    let questionScores: any[] = []; // Local variable for question scores
  
    for (const criteria of matrix) {
      const questions = await this.questionRepository
        .createQueryBuilder("question")
        .where("question.questionType = :questionType", { questionType: criteria.questionType })
        .andWhere("question.grade = :grade", { grade: criteria.grade })
        .andWhere("question.subject = :subject", { subject: criteria.subject })
        .andWhere("question.difficulty_level = :difficulty_level", { difficulty_level: criteria.difficulty_level })
        .orderBy("RANDOM()") // Randomize questions
        .limit(criteria.number_of_questions)
        .getMany();
  
        // console.log(questions);
      if (questions.length < criteria.number_of_questions) {
        throw new Error(`Not enough questions found for criteria: ${JSON.stringify(criteria)}`);
      }
  
      // Store the points for each question
      const questionScoreForCriteria = questions.map((q) => ({
        question_id: q.id,
        points: pointsPerQuestion,
      }));
  
      // Push the points for these questions into the questionScores array
      questionScores.push(...questionScoreForCriteria);
  
      // Add the question data to the generated questions list
      generatedQuestions.push(...questions);
    }
  
    return { generatedQuestions, questionScores }; // Return both questions and their points
  }

  async getAssignmentsByCourse(courseId: number) {
      const assignments = await this.assignmentRepository.find({
        where: { course: { id: courseId } },
        relations: ["course"], // Include course details if needed
      });

      if (!assignments.length) {
        throw new Error("No assignments found for the given course ID.");
      }

      console.log(assignments);
      return assignments;

  }

  // Get a single assignment by ID
  async getAssignmentById(assignmentId: number) {
    const assignments = await this.assignmentRepository.find({
      where: { id:assignmentId },
      relations: ["course"], // Include course details if needed
    });
    // const assignment = await this.assignmentRepository
    // .createQueryBuilder("assignment")
    // .where("assignment.id = :id", { id: assignmentId })
    // .getMany();
      if (!assignments) {
        throw new Error("Assignment not found.");
      }
      // console.log(assignments);
      return assignments;

  }


async getCoursesByCreator(creatorId: number) {
    const user = await this.userRepository.findOneBy({ id: creatorId });
    if (!user) {
      throw new Error("Creator not found");
    }

    const courses = await this.courseRepository.find({
      where: { creator: { id: creatorId } },
      relations: ["creator"],
    });

    return courses;
  }

  async getCourseByIdWithDetails(id: number) {
    const course = await this.courseRepository
      .createQueryBuilder("course")
      .leftJoinAndSelect("course.creator", "user")  // Fixed creator join
      .leftJoinAndSelect("lesson", "lesson", "lesson.course_id = course.id")
      .leftJoinAndSelect("assignment", "assignment", "assignment.course_id = course.id")
      .where("course.id = :id", { id })
      .select([
        "course.id",
        "course.name",
        "course.description",
        "course.class",
        "course.subject",
        "user.id",
        "user.email",
        "lesson.id",
        "lesson.title",
        "lesson.description",
        "lesson.file_url",
        "assignment.id",
        "assignment.title",
        "assignment.description",
        "assignment.questions_scores"
      ])
      .getRawAndEntities();

    if (!course.raw.length) {
      throw new Error("Course not found");
    }

    return {
      ...course.entities[0],
      creator: {
        id: course.raw[0].user_id,
        email: course.raw[0].user_email
      },
      lessons: course.raw.map(row => ({
        id: row.lesson_id,
        title: row.lesson_title,
        description: row.lesson_description,
        file_url: row.lesson_file_url
      })).filter(lesson => lesson.id !== null),
      assignments: course.raw.map(row => ({
        id: row.assignment_id,
        title: row.assignment_title,
        description: row.assignment_description,
        questions_scores: row.assignment_questions_scores
      })).filter(assignment => assignment.id !== null),
    };
}


  async getAllCourses(query: { page?: string | undefined; limit?: string | undefined; }) {
    return await this.courseRepository.find();
  }
  async updateCourse(id: number, body: { 
      name?: string, 
      description?: string, 
      class?: string, 
      subject?: string, 
      image_url?: string, 
      start_time?: string, 
      end_time?: string 
  }) {
      const course = await this.courseRepository.findOneBy({ id });
      if (!course) {
          throw new Error("Course not found");
      }

      Object.assign(course, body);
      return await this.courseRepository.save(course);
  }
  async updateLesson(lessonId: number, body: { title?: string; description?: string; file_url?: string }) {
      const lesson = await this.lessonRepository.findOneBy({ id: lessonId });
      if (!lesson) {
          throw new Error("Lesson not found");
      }

      Object.assign(lesson, body);
      return await this.lessonRepository.save(lesson);
  }
  async updateAssignment(assignmentId: number, body: { title?: string; description?: string; questions_scores?: any }) {
    const assignment = await this.assignmentRepository.findOneBy({ id: assignmentId });
    if (!assignment) {
        throw new Error("Assignment not found");
    }

    Object.assign(assignment, body);
    return await this.assignmentRepository.save(assignment);
  }
  async deleteLesson(lessonId: number) {
      const lesson = await this.lessonRepository.findOneBy({ id: lessonId });
      if (!lesson) {
          throw new Error("Lesson not found");
      }

      await this.lessonRepository.remove(lesson);
      return { message: "Lesson deleted successfully" };
  }
  async deleteAssignment(assignmentId: number) {
      const assignment = await this.assignmentRepository.findOneBy({ id: assignmentId });
      if (!assignment) {
          throw new Error("Assignment not found");
      }

      await this.assignmentRepository.remove(assignment);
      return { message: "Assignment deleted successfully" };
  }


  async deleteCourse(id: number) {
    const course = await this.courseRepository.findOneBy({id});
    if (!course) {
      throw new Error('Course not found');
    }
    await this.courseRepository.remove(course);
    return {message: 'Course deleted successfully'};
  }
}

interface QuestionMatrix {
  questionType: string;
  grade: string;
  subject: string;
  difficulty_level: string;
  number_of_questions: number;
  percent_points: number;
}

export {CourseService};
