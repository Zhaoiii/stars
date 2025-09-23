import { Request, Response } from "express";
import { ReportTemplateService } from "../services/ReportTemplateService";
import { ResponseUtil } from "../utils/response";

export class ReportTemplateController {
  private service: ReportTemplateService;

  constructor() {
    this.service = new ReportTemplateService();
  }

  // 创建模板
  createTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const template = await this.service.createTemplate(req.body);
      ResponseUtil.success(res, template, "创建模板成功", 201);
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "创建模板失败",
        400
      );
    }
  };

  // 获取所有模板
  getAllTemplates = async (_req: Request, res: Response): Promise<void> => {
    try {
      const templates = await this.service.getAllTemplates();
      ResponseUtil.success(res, templates, "获取模板列表成功");
    } catch (error) {
      ResponseUtil.error(res, "获取模板列表失败");
    }
  };

  // 根据ID获取模板
  getTemplateById = async (req: Request, res: Response): Promise<void> => {
    try {
      const template = await this.service.getTemplateById(req.params.id);
      if (!template) {
        ResponseUtil.notFound(res, "模板不存在");
        return;
      }
      ResponseUtil.success(res, template, "获取模板成功");
    } catch (error) {
      ResponseUtil.error(res, "获取模板失败");
    }
  };

  // 根据工具ID获取模板
  getTemplateByToolId = async (req: Request, res: Response): Promise<void> => {
    try {
      const template = await this.service.getTemplateByToolId(
        req.params.toolId
      );
      if (!template) {
        ResponseUtil.notFound(res, "该工具暂无模板");
        return;
      }
      ResponseUtil.success(res, template, "获取模板成功");
    } catch (error) {
      ResponseUtil.error(res, "获取模板失败");
    }
  };

  // 更新模板
  updateTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const template = await this.service.updateTemplate(
        req.params.id,
        req.body
      );
      if (!template) {
        ResponseUtil.notFound(res, "模板不存在");
        return;
      }
      ResponseUtil.success(res, template, "更新模板成功");
    } catch (error) {
      ResponseUtil.error(
        res,
        error instanceof Error ? error.message : "更新模板失败",
        400
      );
    }
  };

  // 删除模板
  deleteTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const ok = await this.service.deleteTemplate(req.params.id);
      if (!ok) {
        ResponseUtil.notFound(res, "模板不存在");
        return;
      }
      ResponseUtil.success(res, null, "删除模板成功");
    } catch (error) {
      ResponseUtil.error(res, "删除模板失败");
    }
  };

  // 发布模板
  publishTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const template = await this.service.publishTemplate(req.params.id);
      if (!template) {
        ResponseUtil.notFound(res, "模板不存在");
        return;
      }
      ResponseUtil.success(res, template, "发布模板成功");
    } catch (error) {
      ResponseUtil.error(res, "发布模板失败");
    }
  };

  // 取消发布模板
  unpublishTemplate = async (req: Request, res: Response): Promise<void> => {
    try {
      const template = await this.service.unpublishTemplate(req.params.id);
      if (!template) {
        ResponseUtil.notFound(res, "模板不存在");
        return;
      }
      ResponseUtil.success(res, template, "取消发布模板成功");
    } catch (error) {
      ResponseUtil.error(res, "取消发布模板失败");
    }
  };
}
