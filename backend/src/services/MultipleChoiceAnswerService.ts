import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { MultipleChoiceAnswer } from "../entities/MultipleChoiceAnswer";

export interface CreateMultipleChoiceAnswerData {
  label: string;
  toolId: string;
  longTermGoalId: string;
  createdBy?: string | null;
}

export interface UpdateMultipleChoiceAnswerData
  extends Partial<CreateMultipleChoiceAnswerData> {}

export interface QueryMultipleChoiceAnswerData {
  toolId?: string;
  longTermGoalId?: string;
  createdBy?: string;
}

export class MultipleChoiceAnswerService {
  private answerRepo: Repository<MultipleChoiceAnswer>;

  constructor() {
    this.answerRepo = AppDataSource.getRepository(MultipleChoiceAnswer);
  }

  // 创建多选答案
  async createAnswer(
    data: CreateMultipleChoiceAnswerData
  ): Promise<MultipleChoiceAnswer> {
    const answer = this.answerRepo.create({
      label: data.label,
      toolId: data.toolId,
      longTermGoalId: data.longTermGoalId,
      createdBy: data.createdBy ?? null,
    });
    return await this.answerRepo.save(answer);
  }

  // 获取所有多选答案
  async getAllAnswers(): Promise<MultipleChoiceAnswer[]> {
    return await this.answerRepo.find({
      relations: ["tool", "longTermGoal", "creator"],
      order: { createdAt: "DESC" },
    });
  }

  // 根据条件查询多选答案
  async getAnswersByQuery(
    query: QueryMultipleChoiceAnswerData
  ): Promise<MultipleChoiceAnswer[]> {
    const where: any = {};

    if (query.toolId) {
      where.toolId = query.toolId;
    }
    if (query.longTermGoalId) {
      where.longTermGoalId = query.longTermGoalId;
    }
    if (query.createdBy) {
      where.createdBy = query.createdBy;
    }

    return await this.answerRepo.find({
      where,
      relations: ["tool", "longTermGoal", "creator"],
      order: { createdAt: "DESC" },
    });
  }

  // 根据工具ID获取多选答案
  async getAnswersByToolId(toolId: string): Promise<MultipleChoiceAnswer[]> {
    return await this.answerRepo.find({
      where: { toolId },
      relations: ["tool", "longTermGoal", "creator"],
      order: { createdAt: "DESC" },
    });
  }

  // 根据长期目标ID获取多选答案
  async getAnswersByLongTermGoalId(
    longTermGoalId: string
  ): Promise<MultipleChoiceAnswer[]> {
    return await this.answerRepo.find({
      where: { longTermGoalId },
      relations: ["tool", "longTermGoal", "creator"],
      order: { createdAt: "DESC" },
    });
  }

  // 根据ID获取多选答案
  async getAnswerById(id: string): Promise<MultipleChoiceAnswer | null> {
    return await this.answerRepo.findOne({
      where: { id },
      relations: ["tool", "longTermGoal", "creator"],
    });
  }

  // 更新多选答案
  async updateAnswer(
    id: string,
    data: UpdateMultipleChoiceAnswerData
  ): Promise<MultipleChoiceAnswer | null> {
    const answer = await this.answerRepo.findOne({ where: { id } });
    if (!answer) return null;

    Object.assign(answer, data);
    return await this.answerRepo.save(answer);
  }

  // 删除多选答案
  async deleteAnswer(id: string): Promise<boolean> {
    const result = await this.answerRepo.delete(id);
    return result.affected !== 0;
  }

  // 批量创建多选答案
  async createAnswers(
    answers: CreateMultipleChoiceAnswerData[]
  ): Promise<MultipleChoiceAnswer[]> {
    const answerEntities = answers.map((data) =>
      this.answerRepo.create({
        label: data.label,
        toolId: data.toolId,
        longTermGoalId: data.longTermGoalId,
        createdBy: data.createdBy ?? null,
      })
    );
    return await this.answerRepo.save(answerEntities);
  }

  // 根据工具ID和长期目标ID删除所有相关答案
  async deleteAnswersByToolAndGoal(
    toolId: string,
    longTermGoalId: string
  ): Promise<number> {
    const result = await this.answerRepo.delete({
      toolId,
      longTermGoalId,
    });
    return result.affected || 0;
  }
}
