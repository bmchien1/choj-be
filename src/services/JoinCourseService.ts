import { Repository } from "typeorm";
import { Course } from "../entities/Course";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";
import { JoinCourseRequest } from "../entities/JoinCourseRequest"; // Make sure this entity exists
import { UserInCourse } from "../entities/UserInCourse"; // Make sure this entity exists

export class JoinCourseService {
  private readonly courseRepository: Repository<Course>;
  private readonly joinCourseRequestRepository: Repository<JoinCourseRequest>;
  private readonly userInCourseRepository: Repository<UserInCourse>;
  private readonly userRepository: Repository<User>;

  private static instance: JoinCourseService;

  constructor() {
    this.courseRepository = AppDataSource.getRepository(Course);
    this.joinCourseRequestRepository = AppDataSource.getRepository(JoinCourseRequest);
    this.userInCourseRepository = AppDataSource.getRepository(UserInCourse);
    this.userRepository = AppDataSource.getRepository(User);
  }

  public static getInstance() {
    if (!JoinCourseService.instance) {
      JoinCourseService.instance = new JoinCourseService();
    }
    return JoinCourseService.instance;
  }

  public async createJoinRequest(userId: number, courseId: number) {
      const user = await this.userRepository.findOne({ where: { id: userId } });
      const course = await this.courseRepository.findOne({ where: { id: courseId } });

      if (!user) {
        throw new Error("User not found");
      }

      if (!course) {
        throw new Error("Course not found");
      }

      // Check if the user is already in the course
      const existingRequest = await this.joinCourseRequestRepository.findOne({
        where: { user: user, course: course },
      });

      if (existingRequest) {
        throw new Error("Request already exists for this course");
      }

      // Create the join request
      const joinRequest = new JoinCourseRequest();
      joinRequest.user = user;
      joinRequest.course = course;

      // Save the request
      return await this.joinCourseRequestRepository.save(joinRequest);
  }

  // Get join course requests by creator
  public async getJoinCourseRequestsByCreator(userId: number) {
      // Get all courses created by the user
      const courses = await this.courseRepository
        .createQueryBuilder("course")
        .where("course.creator = :userId", { userId })
        .getMany();

      if (courses.length === 0) {
        throw new Error("No courses found for the creator");
      }

      // Get all join course requests for the courses created by the user
      const joinRequests = await this.joinCourseRequestRepository
        .createQueryBuilder("request")
        .where("request.course.id IN (:...courseIds)", { courseIds: courses.map(course => course.id) })
        .andWhere("request.approved = :approved", { approved: false })  // Corrected this part
        .getMany();

      return joinRequests;
  }

  public async getAllJoinRequests() {
    const joinRequests = await this.joinCourseRequestRepository.find({
      relations: ["user", "course"],  // To include the related user and course details
    });
  
    if (!joinRequests.length) {
      throw new Error("No join requests found");
    }
  
    return joinRequests;
  }

  // Approve or reject join course request
  public async approveOrRejectRequest(requestId: number, action: "approve" | "reject") {
    const joinRequest = await this.joinCourseRequestRepository.findOne({
      where: { id: requestId },
      relations: ["user", "course"], // Ensure the related entities are fetched
    });

    if (!joinRequest) {
      throw new Error("Join course request not found");
    }

    // Approve the request
    if (action === "approve") {
      // Save the approved request
      await this.joinCourseRequestRepository.remove(joinRequest);

      // Add the user to the course
      const userInCourse = new UserInCourse();
      userInCourse.user = joinRequest.user;
      userInCourse.course = joinRequest.course;

      await this.userInCourseRepository.save(userInCourse);

      return { message: "Request approved and user added to the course" };
    }

    // Reject the request
    if (action === "reject") {
      await this.joinCourseRequestRepository.remove(joinRequest);

      return { message: "Request rejected" };
    }

    throw new Error("Invalid action");
  }

  // Get join course requests by user ID
  public async getJoinCourseRequestsByUser(userId: number) {
    const joinRequests = await this.joinCourseRequestRepository.find({
      where: { user: { id: userId } },
      relations: ["course"],
    });

    if (!joinRequests.length) {
      throw new Error("No join requests found for this user");
    }

    return joinRequests;
  }
}
