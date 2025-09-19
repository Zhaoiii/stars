import { Request, Response } from "express";
import { ShortTermGoalService } from "../services/ShortTermGoalService";
import { ResponseUtil } from "../utils/response";

export class ShortTermGoalController {
  private service: ShortTermGoalService;

  constructor() {
    this.service = new ShortTermGoalService();
  }

  // 创建短期目标
  createGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const goal = await this.service.createGoal(req.body);
      ResponseUtil.success(res, goal, "创建短期目标成功", 201);
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "创建短期目标失败",
        400
      );
    }
  };

  // 获取所有短期目标
  getAllGoals = async (_req: Request, res: Response): Promise<void> => {
    try {
      const goals = await this.service.getAllGoals();
      ResponseUtil.success(res, goals, "获取短期目标列表成功");
    } catch (error) {
      ResponseUtil.error(res, "获取短期目标列表失败");
    }
  };

  // 根据工具ID获取短期目标
  getGoalsByToolId = async (req: Request, res: Response): Promise<void> => {
    try {
      const goals = await this.service.getGoalsByToolId(req.params.id);
      ResponseUtil.success(res, goals, "获取短期目标成功");
    } catch (error) {
      ResponseUtil.error(res, "获取短期目标失败");
    }
  };

  // 根据长期目标ID获取短期目标
  getGoalsByLongTermGoalId = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const goals = await this.service.getGoalsByLongTermGoalId(req.params.id);
      ResponseUtil.success(res, goals, "获取短期目标成功");
    } catch (error) {
      ResponseUtil.error(res, "获取短期目标失败");
    }
  };

  // 根据ID获取短期目标
  getGoalById = async (req: Request, res: Response): Promise<void> => {
    try {
      const goal = await this.service.getGoalById(req.params.id);
      if (!goal) {
        ResponseUtil.notFound(res, "短期目标不存在");
        return;
      }
      ResponseUtil.success(res, goal, "获取短期目标信息成功");
    } catch (error) {
      ResponseUtil.error(res, "获取短期目标信息失败");
    }
  };

  // 更新短期目标
  updateGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const goal = await this.service.updateGoal(req.params.id, req.body);
      if (!goal) {
        ResponseUtil.notFound(res, "短期目标不存在");
        return;
      }
      ResponseUtil.success(res, goal, "更新短期目标成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "更新短期目标失败",
        400
      );
    }
  };

  // 删除短期目标
  deleteGoal = async (req: Request, res: Response): Promise<void> => {
    try {
      const ok = await this.service.deleteGoal(req.params.id);
      if (!ok) {
        ResponseUtil.notFound(res, "短期目标不存在");
        return;
      }
      ResponseUtil.success(res, null, "删除短期目标成功");
    } catch (error) {
      ResponseUtil.error(res, "删除短期目标失败");
    }
  };

  // 重排短期目标
  reorderGoals = async (req: Request, res: Response): Promise<void> => {
    try {
      const longTermGoalId = req.params.id;
      const { orderedGoalIds } = req.body as { orderedGoalIds: string[] };
      if (!Array.isArray(orderedGoalIds) || !orderedGoalIds.length) {
        ResponseUtil.error(res, "orderedGoalIds 必须为非空数组", 400);
        return;
      }
      await this.service.reorderGoals(longTermGoalId, orderedGoalIds);
      ResponseUtil.success(res, null, "重排成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "重排失败",
        400
      );
    }
  };
}
