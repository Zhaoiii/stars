import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import {
  EvaluationRecord,
  EvaluationRecordStatus,
} from "../entities/EvaluationRecord";
import { EvaluationRecordItem } from "../entities/EvaluationRecordItem";

export interface CreateEvaluationRecordPayload {
  studentId: string;
  toolId: string; // 工具 root 节点
}

export class EvaluationRecordService {
  private recordRepo: Repository<EvaluationRecord>;
  private itemRepo: Repository<EvaluationRecordItem>;

  constructor() {
    this.recordRepo = AppDataSource.getRepository(EvaluationRecord);
    this.itemRepo = AppDataSource.getRepository(EvaluationRecordItem);
  }

  async listByStudent(studentId: string): Promise<EvaluationRecord[]> {
    return this.recordRepo.find({
      where: { studentId },
      order: { createdAt: "DESC" },
    });
  }

  async listItems(recordId: string): Promise<EvaluationRecordItem[]> {
    return this.itemRepo.find({ where: { evaluationId: recordId } });
  }

  async create(
    payload: CreateEvaluationRecordPayload,
    userId?: string
  ): Promise<EvaluationRecord> {
    const record = this.recordRepo.create({
      studentId: payload.studentId,
      toolId: payload.toolId,
      createdBy: userId ?? null,
      status: EvaluationRecordStatus.PENDING,
      startedAt: null,
      completedAt: null,
      totalScore: null,
    });
    return await this.recordRepo.save(record);
  }

  async start(recordId: string): Promise<EvaluationRecord | null> {
    const record = await this.recordRepo.findOne({ where: { id: recordId } });
    if (!record) return null;
    if (record.status === EvaluationRecordStatus.COMPLETED) {
      // 已完成则不再修改状态
      return record;
    }
    if (!record.startedAt) record.startedAt = new Date();
    record.status = EvaluationRecordStatus.IN_PROGRESS;
    return await this.recordRepo.save(record);
  }

  async submit(recordId: string): Promise<EvaluationRecord | null> {
    const record = await this.recordRepo.findOne({ where: { id: recordId } });
    if (!record) return null;
    record.status = EvaluationRecordStatus.COMPLETED;
    record.completedAt = new Date();
    // 简单汇总：按 item.score 求和
    const items = await this.itemRepo.find({
      where: { evaluationId: recordId },
    });
    const total = items.reduce((sum, i) => sum + (i.score ?? 0), 0);
    record.totalScore = total;
    return await this.recordRepo.save(record);
  }

  async upsertItem(
    recordId: string,
    longTermGoalId: string,
    answer: any,
    score: number | null
  ): Promise<EvaluationRecordItem> {
    const record = await this.recordRepo.findOne({ where: { id: recordId } });
    if (!record) throw new Error("评估记录不存在");
    if (record.status === EvaluationRecordStatus.COMPLETED) {
      throw new Error("评估已完成，不能再编辑");
    }
    let item = await this.itemRepo.findOne({
      where: { evaluationId: recordId, longTermGoalId },
    });
    if (!item) {
      item = this.itemRepo.create({
        evaluationId: recordId,
        longTermGoalId,
        answer,
        score,
      });
    } else {
      item.answer = answer;
      item.score = score;
    }
    return await this.itemRepo.save(item);
  }

  async getById(recordId: string): Promise<EvaluationRecord | null> {
    return this.recordRepo.findOne({ where: { id: recordId } });
  }
}
