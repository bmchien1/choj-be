import {Repository} from "typeorm";
import {Lesson} from "../entities/Lesson";
import {Course} from "../entities/Course";
import {AppDataSource} from "../data-source";

class LessonService {
  private readonly lessonRepository: Repository<Lesson>;
  private readonly courseRepository: Repository<Course>;
  private static instance: LessonService;

  constructor() {
    this.lessonRepository = AppDataSource.getRepository(Lesson);
    this.courseRepository = AppDataSource.getRepository(Course);
  }

  public static getInstance() {
    if (!LessonService.instance) {
      LessonService.instance = new LessonService();
    }
    return LessonService.instance;
  }

  async createLesson(courseId: number, body: { title: string, description: string }) {
    const course = await this.courseRepository.findOneBy({id: courseId});
    if (!course) {
      throw new Error('Course not found');
    }
    const lesson = new Lesson();
    lesson.title = body.title;
    lesson.description = body.description;
    lesson.course = course;
    return await this.lessonRepository.save(lesson);
  }

  async getLessonsByCourse(courseId: number) {
    return await this.lessonRepository.find({
      where: {course: {id: courseId}},
      relations: ['course'],
    });
  }

  async updateLesson(id: number, body: { title?: string, description?: string }) {
    const lesson = await this.lessonRepository.findOneBy({id});
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    Object.assign(lesson, body);
    return await this.lessonRepository.save(lesson);
  }

  async deleteLesson(id: number) {
    const lesson = await this.lessonRepository.findOneBy({id});
    if (!lesson) {
      throw new Error('Lesson not found');
    }
    await this.lessonRepository.remove(lesson);
    return {message: 'Lesson deleted successfully'};
  }
  async getLessonById(id: number) {
    const lesson = await this.lessonRepository.findOneBy({ id });
    if (!lesson) {
      throw new Error("Lesson not found");
    }
    return lesson;
  }
}

export {LessonService};
