import { Request, Response } from "express";
import { EvaluationService } from "../services/EvaluationService";
import { ResponseUtil } from "../utils/response";

export class EvaluationController {
  private service: EvaluationService;

  constructor() {
    this.service = new EvaluationService();
  }

  // 工具管理
  createTool = async (req: Request, res: Response): Promise<void> => {
    try {
      const tool = await this.service.createTool(req.body);
      ResponseUtil.success(res, tool, "创建工具成功", 201);
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "创建工具失败",
        400
      );
    }
  };

  getTools = async (_req: Request, res: Response): Promise<void> => {
    try {
      const tools = await this.service.getTools();
      ResponseUtil.success(res, tools, "获取工具列表成功");
    } catch (error) {
      ResponseUtil.error(res, "获取工具列表失败");
    }
  };

  // 节点管理
  getChildren = async (req: Request, res: Response): Promise<void> => {
    try {
      const children = await this.service.getChildren(req.params.id);
      ResponseUtil.success(res, children, "获取子节点成功");
    } catch (error) {
      ResponseUtil.error(res, "获取子节点失败");
    }
  };

  createNode = async (req: Request, res: Response): Promise<void> => {
    try {
      const node = await this.service.createNode(req.body);
      ResponseUtil.success(res, node, "创建节点成功", 201);
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "创建节点失败",
        400
      );
    }
  };

  updateNode = async (req: Request, res: Response): Promise<void> => {
    try {
      const node = await this.service.updateNode(req.params.id, req.body);
      if (!node) {
        ResponseUtil.notFound(res, "节点不存在");
        return;
      }
      ResponseUtil.success(res, node, "更新节点成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "更新节点失败",
        400
      );
    }
  };

  deleteNode = async (req: Request, res: Response): Promise<void> => {
    try {
      const ok = await this.service.deleteNode(req.params.id);
      if (!ok) {
        ResponseUtil.notFound(res, "节点不存在");
        return;
      }
      ResponseUtil.success(res, null, "删除节点成功");
    } catch (error) {
      ResponseUtil.error(res, "删除节点失败");
    }
  };

  // 重排同级子节点
  reorderChildren = async (req: Request, res: Response): Promise<void> => {
    try {
      const parentId = req.params.id;
      const { orderedChildIds } = req.body as { orderedChildIds: string[] };
      if (!Array.isArray(orderedChildIds) || !orderedChildIds.length) {
        ResponseUtil.error(res, "orderedChildIds 必须为非空数组", 400);
        return;
      }
      await this.service.reorderChildren(parentId, orderedChildIds);
      ResponseUtil.success(res, null, "重排成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "重排失败",
        400
      );
    }
  };

  // 选项管理
  addOption = async (req: Request, res: Response): Promise<void> => {
    try {
      const option = await this.service.addOption(req.params.id, req.body);
      ResponseUtil.success(res, option, "添加选项成功", 201);
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "添加选项失败",
        400
      );
    }
  };

  updateOption = async (req: Request, res: Response): Promise<void> => {
    try {
      const option = await this.service.updateOption(req.params.id, req.body);
      if (!option) {
        ResponseUtil.notFound(res, "选项不存在");
        return;
      }
      ResponseUtil.success(res, option, "更新选项成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "更新选项失败",
        400
      );
    }
  };

  deleteOption = async (req: Request, res: Response): Promise<void> => {
    try {
      const ok = await this.service.deleteOption(req.params.id);
      if (!ok) {
        ResponseUtil.notFound(res, "选项不存在");
        return;
      }
      ResponseUtil.success(res, null, "删除选项成功");
    } catch (error) {
      ResponseUtil.error(res, "删除选项失败");
    }
  };

  // 树形查询
  getToolTree = async (req: Request, res: Response): Promise<void> => {
    try {
      const tree = await this.service.getToolTree(req.params.id);
      ResponseUtil.success(res, tree, "获取工具树成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "获取工具树失败",
        400
      );
    }
  };
}
