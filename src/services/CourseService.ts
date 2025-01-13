import {Repository} from "typeorm";
import {Course} from "../entities/Course";
import { User } from "../entities/User";
import {AppDataSource} from "../data-source";

class CourseService {
  private readonly courseRepository: Repository<Course>;
  // private readonly userRepository: Repository<User>;
  private static instance: CourseService;

  constructor() {
    this.courseRepository = AppDataSource.getRepository(Course);
    // this.userRepository = AppDataSource.getRepository(User);
  }

  public static getInstance() {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService();
    }
    return CourseService.instance;
  }

  async createCourse(body: { name: string, description: string, class: string}) {
    console.log(body);

    const course = new Course();
    course.name = body.name;
    course.description = body.description;
    course.class = body.class;
    console.log(course);
    return await this.courseRepository.save(course);
  }

  // async getCoursesByUser(userIdentifier: { email?: string}) {
  //   const user = await this.userRepository.findOneBy(userIdentifier);
  //   if (!user) {
  //     throw new Error("User not found");
  //   }

  //   const courses = await this.courseRepository.find({
  //     where: { user: { id: user.id } },
  //     relations: ["user"],
  //   });

  //   return courses;
  // }

  async getCourseById(id: number) {
    const course = await this.courseRepository.findOneBy({id});
    if (!course) {
      throw new Error('Course not found');
    }
    return course;
  }

  async getAllCourses(query: { page?: string | undefined; limit?: string | undefined; }) {
    return await this.courseRepository.find();
  }

  async updateCourse(id: number, body: { title?: string, description?: string }) {
    const course = await this.courseRepository.findOneBy({id});
    if (!course) {
      throw new Error('Course not found');
    }
    Object.assign(course, body);
    return await this.courseRepository.save(course);
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

export {CourseService};
