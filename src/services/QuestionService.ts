import { Repository } from "typeorm";
import { Question } from "../entities/Question";
import { MultipleChoiceQuestion } from "../entities/MultipleChoiceQuestion";
import { ShortAnswerQuestion } from "../entities/ShortAnswerQuestion";
import { TrueFalseQuestion } from "../entities/TrueFalseQuestion";
import { CodingQuestion } from "../entities/CodingQuestion";
import { AppDataSource } from "../data-source";

class QuestionService {
  private readonly questionRepository: Repository<Question>;
  private readonly multipleChoiceRepository: Repository<MultipleChoiceQuestion>;
  private readonly shortAnswerRepository: Repository<ShortAnswerQuestion>;
  private readonly trueFalseRepository: Repository<TrueFalseQuestion>;
  private readonly codingRepository: Repository<CodingQuestion>;
  private static instance: QuestionService;

  constructor() {
    this.questionRepository = AppDataSource.getRepository(Question);
    this.multipleChoiceRepository = AppDataSource.getRepository(MultipleChoiceQuestion);
    this.shortAnswerRepository = AppDataSource.getRepository(ShortAnswerQuestion);
    this.trueFalseRepository = AppDataSource.getRepository(TrueFalseQuestion);
    this.codingRepository = AppDataSource.getRepository(CodingQuestion);
  }

  public static getInstance() {
    if (!QuestionService.instance) {
      QuestionService.instance = new QuestionService();
    }
    return QuestionService.instance;
  }

  async createQuestion(body: any) {
    const { questionType, ...commonData } = body;
    const baseQuestion = this.questionRepository.create({
      questionName: commonData.question,
      questionType: questionType,
      grade: commonData.grade,
      subject: commonData.subject,
      difficulty_level: commonData.difficulty_level,
    });
  
    // Save the base Question record
    const savedQuestion = await this.questionRepository.save(baseQuestion);
    let createdQuestion;

    switch (questionType) {
      case "multiple-choice":
        createdQuestion = this.multipleChoiceRepository.create({
          question_id: savedQuestion,
          choices: body.choices.map((choice: any) => ({
            choice: choice.choice,
          })),
          correct_answer: body.correct_answer,
        });
        return await this.multipleChoiceRepository.save(createdQuestion);

      case "short-answer":
        createdQuestion = this.shortAnswerRepository.create({
          question_id: savedQuestion,
          correct_answer: body.correct_answer,
        });
        return await this.shortAnswerRepository.save(createdQuestion);

      case "true-false":
        createdQuestion = this.trueFalseRepository.create({
          question_id: savedQuestion,
          choice: body.choices.map((choice: any) => ({
            choice: choice.choice,
            statement: choice.statement,
          })),
        });
        return await this.trueFalseRepository.save(createdQuestion);

      case "coding":
        createdQuestion = this.codingRepository.create({
          question_id: savedQuestion,
          template_code: body.templateCode,
          test_cases: body.testCases,
        });
        return await this.codingRepository.save(createdQuestion);

      default:
        throw new Error("Unsupported question type");
    }
  }

  async getQuestionById(id: number) {
    return await this.questionRepository.findOne({
      where: { id },
      relations: ["choices", "testCases"], // Include relations for complex types
    });
  }

  async getAllQuestions(query: { page?: string | undefined; limit?: string | undefined; }) {
    return await this.questionRepository.find();
  }

  async updateQuestion(id: number, body: any) {
    const question = await this.getQuestionById(id);
    if (!question) throw new Error("Question not found");

    Object.assign(question, body);
    return await this.questionRepository.save(question);
  }

  async deleteQuestion(id: number) {
    const question = await this.getQuestionById(id);
    if (!question) throw new Error("Question not found");

    await this.questionRepository.remove(question);
    return { message: "Question deleted successfully" };
  }
}

export { QuestionService };
