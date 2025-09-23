import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import {
  EvaluationRecord,
  EvaluationRecordStatus,
} from "../entities/EvaluationRecord";
import { EvaluationRecordItem } from "../entities/EvaluationRecordItem";
import { Student } from "../entities/Student";
import { EvaluationService } from "./EvaluationService";

export interface CreateEvaluationRecordPayload {
  studentId: string;
  toolId: string; // 工具 root 节点
}

export class EvaluationRecordService {
  private recordRepo: Repository<EvaluationRecord>;
  private itemRepo: Repository<EvaluationRecordItem>;
  private studentRepo: Repository<Student>;
  private evaluationService: EvaluationService;

  constructor() {
    this.recordRepo = AppDataSource.getRepository(EvaluationRecord);
    this.itemRepo = AppDataSource.getRepository(EvaluationRecordItem);
    this.studentRepo = AppDataSource.getRepository(Student);
    this.evaluationService = new EvaluationService();
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

  // 聚合报告：工具树 + 评估条目分数/答案 + 学生信息
  async getReport(recordId: string): Promise<any | null> {
    const record = await this.recordRepo.findOne({ where: { id: recordId } });
    if (!record) return null;

    const [student, items, toolTree] = await Promise.all([
      this.studentRepo.findOne({ where: { id: parseInt(record.studentId) } }),
      this.itemRepo.find({ where: { evaluationId: recordId } }),
      this.evaluationService.getToolTree(record.toolId),
    ]);

    // 建立条目映射：longTermGoalId -> { answer, score }
    const itemMap = new Map<string, { answer: any; score: number | null }>();
    for (const it of items) {
      itemMap.set(String(it.longTermGoalId), {
        answer: it.answer ?? null,
        score: it.score ?? null,
      });
    }

    // 深度拷贝并注入分数/答案；父节点分数 = 子节点分数之和；叶子分数 = 条目分数
    const injectScores = (node: any): any => {
      // 后端 getToolTree 已返回 children 为对象（id->node）
      const childObj =
        node.children && typeof node.children === "object" ? node.children : {};
      const childEntries = Object.entries(childObj) as Array<[string, any]>;
      const injectedChildren: Record<string, any> = {};
      for (const [id, child] of childEntries) {
        injectedChildren[id] = injectScores(child);
      }

      const mapped = itemMap.get(String(node.id));
      const isLeaf = childEntries.length === 0;

      let nodeScore = 0;
      if (isLeaf) {
        nodeScore = Number(mapped?.score ?? 0) || 0;
      } else {
        nodeScore = Object.values(injectedChildren).reduce(
          (sum: number, c: any) => sum + (Number((c as any)?.score) || 0),
          0
        );
      }

      const self: any = {
        ...node,
        children: injectedChildren,
        score: nodeScore,
      };
      if (mapped) {
        self.answer = mapped.answer;
      }
      return self;
    };

    const treeWithScores = injectScores(toolTree);

    return {
      student: student ?? null,
      evaluation: record,
      toolTree: treeWithScores,
    };
  }
}
