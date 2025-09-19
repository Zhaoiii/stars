import { Request, Response } from "express";
import { MultipleChoiceAnswerService } from "../services/MultipleChoiceAnswerService";
import { ResponseUtil } from "../utils/response";

export class MultipleChoiceAnswerController {
  private service: MultipleChoiceAnswerService;

  constructor() {
    this.service = new MultipleChoiceAnswerService();
  }

  // 创建多选答案
  createAnswer = async (req: Request, res: Response): Promise<void> => {
    try {
      const answer = await this.service.createAnswer(req.body);
      ResponseUtil.success(res, answer, "创建多选答案成功", 201);
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "创建多选答案失败",
        400
      );
    }
  };

  // 获取所有多选答案
  getAllAnswers = async (_req: Request, res: Response): Promise<void> => {
    try {
      const answers = await this.service.getAllAnswers();
      ResponseUtil.success(res, answers, "获取多选答案列表成功");
    } catch (error) {
      ResponseUtil.error(res, "获取多选答案列表失败");
    }
  };

  // 根据条件查询多选答案
  getAnswersByQuery = async (req: Request, res: Response): Promise<void> => {
    try {
      const { toolId, longTermGoalId, createdBy } = req.query;
      const query: any = {};

      if (toolId) query.toolId = toolId as string;
      if (longTermGoalId) query.longTermGoalId = longTermGoalId as string;
      if (createdBy) query.createdBy = createdBy as string;

      const answers = await this.service.getAnswersByQuery(query);
      ResponseUtil.success(res, answers, "获取多选答案成功");
    } catch (error) {
      ResponseUtil.error(res, "获取多选答案失败");
    }
  };

  // 根据工具ID获取多选答案
  getAnswersByToolId = async (req: Request, res: Response): Promise<void> => {
    try {
      const answers = await this.service.getAnswersByToolId(req.params.id);
      ResponseUtil.success(res, answers, "获取多选答案成功");
    } catch (error) {
      ResponseUtil.error(res, "获取多选答案失败");
    }
  };

  // 根据长期目标ID获取多选答案
  getAnswersByLongTermGoalId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const answers = await this.service.getAnswersByLongTermGoalId(
        req.params.id
      );
      ResponseUtil.success(res, answers, "获取多选答案成功");
    } catch (error) {
      ResponseUtil.error(res, "获取多选答案失败");
    }
  };

  // 根据ID获取多选答案
  getAnswerById = async (req: Request, res: Response): Promise<void> => {
    try {
      const answer = await this.service.getAnswerById(req.params.id);
      if (!answer) {
        ResponseUtil.notFound(res, "多选答案不存在");
        return;
      }
      ResponseUtil.success(res, answer, "获取多选答案信息成功");
    } catch (error) {
      ResponseUtil.error(res, "获取多选答案信息失败");
    }
  };

  // 更新多选答案
  updateAnswer = async (req: Request, res: Response): Promise<void> => {
    try {
      const answer = await this.service.updateAnswer(req.params.id, req.body);
      if (!answer) {
        ResponseUtil.notFound(res, "多选答案不存在");
        return;
      }
      ResponseUtil.success(res, answer, "更新多选答案成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "更新多选答案失败",
        400
      );
    }
  };

  // 删除多选答案
  deleteAnswer = async (req: Request, res: Response): Promise<void> => {
    try {
      const ok = await this.service.deleteAnswer(req.params.id);
      if (!ok) {
        ResponseUtil.notFound(res, "多选答案不存在");
        return;
      }
      ResponseUtil.success(res, null, "删除多选答案成功");
    } catch (error) {
      ResponseUtil.error(res, "删除多选答案失败");
    }
  };

  // 批量创建多选答案
  createAnswers = async (req: Request, res: Response): Promise<void> => {
    try {
      const { answers } = req.body;
      if (!Array.isArray(answers)) {
        ResponseUtil.error(res, "answers 必须为数组", 400);
        return;
      }
      const createdAnswers = await this.service.createAnswers(answers);
      ResponseUtil.success(res, createdAnswers, "批量创建多选答案成功", 201);
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "批量创建多选答案失败",
        400
      );
    }
  };

  // 根据工具ID和长期目标ID删除所有相关答案
  deleteAnswersByToolAndGoal = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { toolId, longTermGoalId } = req.params;
      const deletedCount = await this.service.deleteAnswersByToolAndGoal(
        toolId,
        longTermGoalId
      );
      ResponseUtil.success(res, { deletedCount }, "删除相关多选答案成功");
    } catch (error) {
      ResponseUtil.error(res, "删除相关多选答案失败");
    }
  };
}
