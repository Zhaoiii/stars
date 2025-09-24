import { Request, Response } from "express";
import { EvaluationRecordService } from "../services/EvaluationRecordService";
import { ResponseUtil } from "../utils/response";

export class EvaluationRecordController {
  private service: EvaluationRecordService;

  constructor() {
    this.service = new EvaluationRecordService();
  }

  listByStudent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const list = await this.service.listByStudent(id);
      ResponseUtil.success(res, list, "获取评估记录成功");
    } catch (error) {
      ResponseUtil.error(res, "获取评估记录失败");
    }
  };

  listItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const items = await this.service.listItems(id);
      ResponseUtil.success(res, items, "获取评估条目成功");
    } catch (error) {
      ResponseUtil.error(res, "获取评估条目失败");
    }
  };

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { studentId, toolId } = req.body as {
        studentId: string;
        toolId: string;
      };
      const userId = (req as any).user?.id as string | undefined;
      const record = await this.service.create({ studentId, toolId }, userId);
      ResponseUtil.success(res, record, "创建评估记录成功", 201);
    } catch (error) {
      ResponseUtil.error(res, "创建评估记录失败", 400);
    }
  };

  start = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const record = await this.service.start(id);
      if (!record) return ResponseUtil.notFound(res, "评估记录不存在");
      ResponseUtil.success(res, record, "开始评估成功");
    } catch (error) {
      ResponseUtil.error(res, "开始评估失败");
    }
  };

  submit = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const record = await this.service.submit(id);
      if (!record) return ResponseUtil.notFound(res, "评估记录不存在");
      ResponseUtil.success(res, record, "提交评估成功");
    } catch (error) {
      ResponseUtil.error(res, "提交评估失败");
    }
  };

  upsertItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { longTermGoalId, answer, score } = req.body as any;
      const item = await this.service.upsertItem(
        id,
        longTermGoalId,
        answer,
        score ?? null
      );
      ResponseUtil.success(res, item, "保存评估条目成功");
    } catch (error) {
      ResponseUtil.error(res, "保存评估条目失败", 400);
    }
  };

  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const record = await this.service.getById(id);
      if (!record) return ResponseUtil.notFound(res, "评估记录不存在");
      ResponseUtil.success(res, record, "获取评估详情成功");
    } catch (error) {
      ResponseUtil.error(res, "获取评估详情失败");
    }
  };

  // 获取评估报告详情：工具树 + 条目分数/答案 + 学生信息
  getReport = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const report = await this.service.getReport(id);
      if (!report) return ResponseUtil.notFound(res, "评估记录不存在");
      ResponseUtil.success(res, report, "获取评估报告成功");
    } catch (error) {
      ResponseUtil.error(res, "获取评估报告失败");
    }
  };

  // 获取评估记录（含 reportContent）
  getById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const record = await this.service.getById(id);
      if (!record) return ResponseUtil.notFound(res, "评估记录不存在");
      ResponseUtil.success(res, record, "获取评估记录成功");
    } catch (error) {
      ResponseUtil.error(res, "获取评估记录失败");
    }
  };

  // 保存报告内容（reportContent: json）
  saveReportContent = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { content } = req.body as { content: any };
      const saved = await this.service.saveReportContent(id, content);
      ResponseUtil.success(res, saved, "保存报告成功");
    } catch (error: any) {
      ResponseUtil.error(res, error?.message || "保存报告失败", 400);
    }
  };
}
