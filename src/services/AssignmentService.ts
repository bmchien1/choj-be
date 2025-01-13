import { Repository } from "typeorm";
import { Assignment } from "../entities/Assignment";
import { Course } from "../entities/Course";
import { AppDataSource } from "../data-source";

class AssignmentService {
  private readonly assignmentRepository: Repository<Assignment>;
  private readonly courseRepository: Repository<Course>;
  private static instance: AssignmentService;

  constructor() {
    this.assignmentRepository = AppDataSource.getRepository(Assignment);
    this.courseRepository = AppDataSource.getRepository(Course);
  }

  public static getInstance() {
    if (!AssignmentService.instance) {
      AssignmentService.instance = new AssignmentService();
    }
    return AssignmentService.instance;
  }

  async createAssignment(
    courseId: number,
    assignmentData: {
      title: string;
      description: string;
      duration: string;
      start_time?: Date | string; // Accept both Date and string
      end_time?: Date | string;
      questions_scores?: any;
    }
  ) {
    // Find course by ID
    const course = await this.courseRepository.findOneBy({ id: courseId });
    if (!course) {
      throw new Error("Course not found");
    }

    // Create new assignment instance
    const assignment = new Assignment();
    assignment.course = course;
    assignment.title = assignmentData.title;
    assignment.description = assignmentData.description;
    assignment.duration = assignmentData.duration;

    // Convert start_time and end_time to Date objects if they are strings
    assignment.start_time = assignmentData.start_time
      ? new Date(assignmentData.start_time)
      : new Date();
    assignment.end_time = assignmentData.end_time
      ? new Date(assignmentData.end_time)
      : new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000); // 12 weeks from now

    assignment.questions_scores = assignmentData.questions_scores;

    // Save to repository
    return await this.assignmentRepository.save(assignment);
  }

  async getAssignmentsByCourse(courseId: number) {
    return await this.assignmentRepository.find({
      where: { course: { id: courseId } },
      relations: ["course"],
    });
  }

  async getAssignmentById(id: number) {
    const assignment = await this.assignmentRepository.findOne({
      where: { id },
      relations: ["course"],
    });
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    return assignment;
  }

  async updateAssignment(id: number, body: { title?: string; description?: string; duration?: string; start_time?: Date | string; end_time?: Date |string; questions_scores?: any }) {
    const assignment = await this.assignmentRepository.findOneBy({ id });
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    Object.assign(assignment, body);
    return await this.assignmentRepository.save(assignment);
  }

  async deleteAssignment(id: number) {
    const assignment = await this.assignmentRepository.findOneBy({ id });
    if (!assignment) {
      throw new Error("Assignment not found");
    }
    await this.assignmentRepository.remove(assignment);
    return { message: "Assignment deleted successfully" };
  }
}

export { AssignmentService };
