import { Repository } from "typeorm";
import { Test } from "../entities/Test";
import { AppDataSource } from "../data-source";

class TestService {
  private readonly testRepository: Repository<Test>;
  private static instance: TestService;

  constructor() {
    this.testRepository = AppDataSource.getRepository(Test);
  }

  public static getInstance() {
    if (!TestService.instance) {
      TestService.instance = new TestService();
    }
    return TestService.instance;
  }

  async createTest(userId: number, testData: any) {
    const test = this.testRepository.create({
      user: { id: userId },
      ...testData,
    });
    return await this.testRepository.save(test);
  }

  async getAllTests(query: any) {
    const { page = 0, limit = 10, userId } = query;
    const [tests, total] = await this.testRepository.findAndCount({
      where: userId ? { user: { id: userId } } : {},
      skip: page * limit,
      take: limit,
      order: { createdAt: "DESC" },
    });
    return { tests, total, page, limit };
  }

  async getTestById(id: number) {
    const test = await this.testRepository.findOne({
      where: { id },
      relations: ["user", "creater"],
    });
    if (!test) {
      throw new Error("Test not found");
    }
    return test;
  }

  async updateTest(id: number, testData: any) {
    const test = await this.testRepository.findOneBy({ id });
    if (!test) {
      throw new Error("Test not found");
    }
    Object.assign(test, testData);
    return await this.testRepository.save(test);
  }

  async deleteTest(id: number) {
    const test = await this.testRepository.findOneBy({ id });
    if (!test) {
      throw new Error("Test not found");
    }
    await this.testRepository.remove(test);
    return { message: "Test deleted successfully" };
  }
}

export { TestService };
