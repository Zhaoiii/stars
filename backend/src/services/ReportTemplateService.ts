import { Repository } from "typeorm";
import { AppDataSource } from "../config/database";
import { ReportTemplate } from "../entities/ReportTemplate";
import { EvaluationToolNode } from "../entities/EvaluationToolNode";

export interface CreateTemplateData {
  toolId: string;
  title: string;
  description?: string | null;
  content: any;
  status?: "draft" | "published";
}

export interface UpdateTemplateData extends Partial<CreateTemplateData> {}

export class ReportTemplateService {
  private templateRepo: Repository<ReportTemplate>;
  private toolRepo: Repository<EvaluationToolNode>;

  constructor() {
    this.templateRepo = AppDataSource.getRepository(ReportTemplate);
    this.toolRepo = AppDataSource.getRepository(EvaluationToolNode);
  }

  // 创建模板
  async createTemplate(data: CreateTemplateData): Promise<ReportTemplate> {
    // 检查评估工具是否存在
    const tool = await this.toolRepo.findOne({ where: { id: data.toolId } });
    if (!tool) {
      throw new Error("评估工具不存在");
    }

    // 检查该工具是否已有模板
    const existingTemplate = await this.templateRepo.findOne({
      where: { toolId: data.toolId },
    });
    if (existingTemplate) {
      throw new Error("该评估工具已存在模板，每个工具只能绑定一个模板");
    }

    const template = this.templateRepo.create({
      toolId: data.toolId,
      title: data.title,
      description: data.description ?? null,
      content: data.content,
      status: data.status ?? "draft",
    });

    return await this.templateRepo.save(template);
  }

  // 获取所有模板
  async getAllTemplates(): Promise<ReportTemplate[]> {
    return await this.templateRepo.find({
      relations: ["tool"],
      order: { createdAt: "DESC" },
    });
  }

  // 根据ID获取模板
  async getTemplateById(id: string): Promise<ReportTemplate | null> {
    return await this.templateRepo.findOne({
      where: { id },
      relations: ["tool"],
    });
  }

  // 根据工具ID获取模板
  async getTemplateByToolId(toolId: string): Promise<ReportTemplate | null> {
    return await this.templateRepo.findOne({
      where: { toolId },
      relations: ["tool"],
    });
  }

  // 更新模板
  async updateTemplate(
    id: string,
    data: UpdateTemplateData
  ): Promise<ReportTemplate | null> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) return null;

    // 如果要更换工具，检查新工具是否已有模板
    if (data.toolId && data.toolId !== template.toolId) {
      const tool = await this.toolRepo.findOne({ where: { id: data.toolId } });
      if (!tool) {
        throw new Error("评估工具不存在");
      }

      const existingTemplate = await this.templateRepo.findOne({
        where: { toolId: data.toolId },
      });
      if (existingTemplate && existingTemplate.id !== id) {
        throw new Error("该评估工具已存在模板，每个工具只能绑定一个模板");
      }
    }

    Object.assign(template, data);
    return await this.templateRepo.save(template);
  }

  // 删除模板
  async deleteTemplate(id: string): Promise<boolean> {
    const result = await this.templateRepo.delete(id);
    return result.affected !== 0;
  }

  // 发布模板
  async publishTemplate(id: string): Promise<ReportTemplate | null> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) return null;

    template.status = "published";
    return await this.templateRepo.save(template);
  }

  // 取消发布模板
  async unpublishTemplate(id: string): Promise<ReportTemplate | null> {
    const template = await this.templateRepo.findOne({ where: { id } });
    if (!template) return null;

    template.status = "draft";
    return await this.templateRepo.save(template);
  }
}
