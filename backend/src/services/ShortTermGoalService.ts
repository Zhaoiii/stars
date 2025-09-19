import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { ShortTermGoal } from "../entities/ShortTermGoal";
import { EvaluationScoringType } from "../types/enums";

export interface CreateShortTermGoalData {
  longTermGoalId: string;
  toolId: string;
  title: string;
  description?: string | null;
  order?: number;
}

export interface UpdateShortTermGoalData
  extends Partial<CreateShortTermGoalData> {}

export class ShortTermGoalService {
  private goalRepo: Repository<ShortTermGoal>;

  constructor() {
    this.goalRepo = AppDataSource.getRepository(ShortTermGoal);
  }

  // 创建短期目标
  async createGoal(data: CreateShortTermGoalData): Promise<ShortTermGoal> {
    // 自动排序：追加到同级末尾
    let computedOrder = data.order ?? null;
    if (computedOrder == null) {
      const last = await this.goalRepo.find({
        where: { longTermGoalId: data.longTermGoalId },
        order: { order: "DESC" },
        take: 1,
      });
      computedOrder = last.length ? (last[0].order ?? 0) + 1 : 0;
    }

    const goal = this.goalRepo.create({
      longTermGoalId: data.longTermGoalId,
      toolId: data.toolId,
      title: data.title,
      description: data.description ?? null,
      order: computedOrder,
    });
    return await this.goalRepo.save(goal);
  }

  // 获取所有短期目标
  async getAllGoals(): Promise<ShortTermGoal[]> {
    return await this.goalRepo.find({
      relations: ["longTermGoal", "tool"],
      order: { createdAt: "DESC" },
    });
  }

  // 根据工具ID获取短期目标
  async getGoalsByToolId(toolId: string): Promise<ShortTermGoal[]> {
    return await this.goalRepo.find({
      where: { toolId },
      relations: ["longTermGoal", "tool"],
      order: { order: "ASC", id: "ASC" },
    });
  }

  // 根据长期目标ID获取短期目标
  async getGoalsByLongTermGoalId(
    longTermGoalId: string
  ): Promise<ShortTermGoal[]> {
    return await this.goalRepo.find({
      where: { longTermGoalId },
      order: { order: "ASC", id: "ASC" },
    });
  }

  // 根据ID获取短期目标
  async getGoalById(id: string): Promise<ShortTermGoal | null> {
    return await this.goalRepo.findOne({
      where: { id },
      relations: ["longTermGoal", "tool"],
    });
  }

  // 更新短期目标
  async updateGoal(
    id: string,
    data: UpdateShortTermGoalData
  ): Promise<ShortTermGoal | null> {
    const goal = await this.goalRepo.findOne({ where: { id } });
    if (!goal) return null;

    Object.assign(goal, data);
    return await this.goalRepo.save(goal);
  }

  // 删除短期目标
  async deleteGoal(id: string): Promise<boolean> {
    const result = await this.goalRepo.delete(id);
    return result.affected !== 0;
  }

  // 重排短期目标顺序
  async reorderGoals(
    longTermGoalId: string,
    orderedGoalIds: string[]
  ): Promise<void> {
    const goals = await this.goalRepo.find({
      where: { longTermGoalId },
      order: { order: "ASC", id: "ASC" },
    });
    const existingIds = new Set(goals.map((g) => String(g.id)));
    const incomingIds = new Set(orderedGoalIds.map(String));
    if (
      existingIds.size !== incomingIds.size ||
      [...existingIds].some((id) => !incomingIds.has(id))
    ) {
      throw new Error("重排的 ID 列表与现有短期目标不一致");
    }

    // 依序写入 order
    for (let i = 0; i < orderedGoalIds.length; i++) {
      const id = orderedGoalIds[i];
      await this.goalRepo.update({ id }, { order: i });
    }
  }
}
