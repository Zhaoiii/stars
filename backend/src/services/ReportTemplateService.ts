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

    // 允许同一工具存在多个模板，仅限制“发布状态”唯一
    if (data.status === "published") {
      const published = await this.templateRepo.findOne({
        where: { toolId: data.toolId, status: "published" },
      });
      if (published) {
        throw new Error("该评估工具已存在已发布的模板，发布状态仅能有一个");
      }
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
      where: { toolId, status: "published" },
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

    // 如果要更换工具或更新为发布状态，校验“发布状态唯一”
    if (data.toolId && data.toolId !== template.toolId) {
      const tool = await this.toolRepo.findOne({ where: { id: data.toolId } });
      if (!tool) {
        throw new Error("评估工具不存在");
      }
    }

    // 若将状态更新为 published，确保同一 toolId 没有其他 published
    const targetToolId = data.toolId ?? template.toolId;
    if (data.status === "published") {
      const published = await this.templateRepo.findOne({
        where: { toolId: targetToolId, status: "published" },
      });
      if (published && published.id !== id) {
        throw new Error("该评估工具已存在已发布的模板，发布状态仅能有一个");
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
    // 发布前校验同工具唯一
    const published = await this.templateRepo.findOne({
      where: { toolId: template.toolId, status: "published" },
    });
    if (published && published.id !== id) {
      throw new Error("该评估工具已存在已发布的模板，发布状态仅能有一个");
    }
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
